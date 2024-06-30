import { type Config, getBalance } from '@wagmi/core';
import { type SendTransactionMutateAsync } from '@wagmi/core/query';
import { createWalletClient, type Address, http, erc20Abi } from 'viem';
import { estimateGas, readContract, waitForTransactionReceipt, writeContract } from 'viem/actions';

import { generateStrategyAccount } from 'blockchain-api/generateStrategyAccount';
import { HedgeConfigI } from 'types/types';

import { getGasPrice } from 'blockchain-api/getGasPrice';
import { wagmiConfig } from 'blockchain-api/wagmi/wagmiClient';
import { getGasLimit } from 'blockchain-api/getGasLimit';
import { MethodE } from 'types/enums';
import { MULTISIG_ADDRESS_TIMEOUT, NORMAL_ADDRESS_TIMEOUT } from '../constants';

const GAS_TARGET = 1_000_000n;

export async function claimStrategyFunds(
  { chainId, walletClient, isMultisigAddress, symbol, traderAPI }: HedgeConfigI,
  sendTransactionAsync: SendTransactionMutateAsync<Config, unknown>
): Promise<{
  hash: Address | null;
}> {
  if (!walletClient.account?.address) {
    throw new Error('Account not connected');
  }

  //console.log('generating account');
  const hedgeClient = await generateStrategyAccount(walletClient).then((account) =>
    createWalletClient({
      account,
      chain: walletClient.chain,
      transport: http(),
    })
  );

  //console.log('get position');
  const position = await traderAPI
    .positionRisk(hedgeClient.account.address, symbol)
    .then((pos) => pos[0])
    .catch(() => undefined);
  const settleTokenAddr = traderAPI.getSettlementTokenFromSymbol(symbol);
  const settleTokenDec = traderAPI.getSettlementTokenDecimalsFromSymbol(symbol);
  if (!position || !settleTokenAddr || !settleTokenDec) {
    throw new Error(`No hedging strategy available for symbol ${symbol} on chain ID ${chainId}`);
  }
  if (position.positionNotionalBaseCCY !== 0) {
    throw new Error(
      `Invalid hedging position for trader ${walletClient.account?.address} and symbol ${symbol} on chain ID ${chainId}`
    );
  }

  //console.log('get balance and gas');
  const settleTokenBalance = await readContract(walletClient, {
    address: settleTokenAddr as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [hedgeClient.account.address],
  });
  const gasPrice = await getGasPrice(walletClient.chain?.id);
  if (settleTokenBalance > 0n) {
    const params = {
      address: settleTokenAddr as Address,
      chain: walletClient.chain,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [walletClient.account.address, settleTokenBalance],
      account: hedgeClient.account,
      gasPrice,
    };

    //console.log('estimateGas: erc20');
    const gasLimit = await estimateGas(hedgeClient, params)
      .then((gas) => (gas * 150n) / 100n)
      .catch(() => getGasLimit({ chainId: walletClient?.chain?.id, method: MethodE.Interact }));
    const { value: balance } = await getBalance(wagmiConfig, { address: hedgeClient.account.address });
    if (!gasLimit || balance < gasPrice * gasLimit) {
      //console.log('sending funds to strategy acct');
      const tx0 = await sendTransactionAsync({
        account: walletClient.account,
        chainId: walletClient.chain?.id,
        to: hedgeClient.account.address,
        value: (gasLimit ?? GAS_TARGET) * gasPrice,
      });
      await waitForTransactionReceipt(hedgeClient, {
        hash: tx0,
        timeout: isMultisigAddress ? MULTISIG_ADDRESS_TIMEOUT : NORMAL_ADDRESS_TIMEOUT,
      });
    }

    //console.log(`sending ${marginTokenBalance} tokens`);
    const tx1 = await writeContract(hedgeClient, {
      address: settleTokenAddr as Address,
      chain: walletClient.chain,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [walletClient.account.address, settleTokenBalance],
      account: hedgeClient.account,
      gas: gasLimit,
      gasPrice,
    });
    await waitForTransactionReceipt(hedgeClient, {
      hash: tx1,
      timeout: isMultisigAddress ? MULTISIG_ADDRESS_TIMEOUT : NORMAL_ADDRESS_TIMEOUT,
    });
  }

  //console.log('estimateGas: gas');
  const gasLimit = await estimateGas(walletClient, {
    to: walletClient.account.address,
    value: 1n,
    account: hedgeClient.account,
    gasPrice,
  })
    .then((gas) => (gas * 150n) / 100n)
    .catch(() => getGasLimit({ chainId: walletClient?.chain?.id, method: MethodE.Interact }));
  const { value: balance } = await getBalance(wagmiConfig, { address: hedgeClient.account.address });
  if (gasLimit && gasLimit * gasPrice < balance) {
    return sendTransactionAsync({
      account: hedgeClient.account,
      chainId: hedgeClient.chain?.id,
      to: walletClient.account.address,
      value: balance - gasLimit * gasPrice,
    }).then((tx) => ({ hash: tx }));
  }
  return { hash: null };
}
