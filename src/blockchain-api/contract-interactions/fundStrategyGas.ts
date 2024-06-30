import { type Config } from '@wagmi/core';
import { type SendTransactionMutateAsync } from '@wagmi/core/query';
import { Address, WalletClient, createWalletClient, http } from 'viem';
import { getBalance, waitForTransactionReceipt } from 'viem/actions';

import { MULTISIG_ADDRESS_TIMEOUT, NORMAL_ADDRESS_TIMEOUT, STRATEGY_WALLET_GAS_TARGET } from 'blockchain-api/constants';
import { getGasPrice } from 'blockchain-api/getGasPrice';
import { generateStrategyAccount } from 'blockchain-api/generateStrategyAccount';
import { Dispatch, SetStateAction } from 'react';

interface FundWalletPropsI {
  walletClient: WalletClient;
  strategyAddress?: Address;
  isMultisigAddress: boolean | null;
  gasAmount?: bigint;
}

export async function fundStrategyGas(
  { walletClient, strategyAddress, isMultisigAddress, gasAmount }: FundWalletPropsI,
  sendTransactionAsync: SendTransactionMutateAsync<Config, unknown>,
  setCurrentPhaseKey: Dispatch<SetStateAction<string>>
) {
  if (!walletClient.account?.address) {
    throw new Error('Account not connected');
  }
  let strategyAddr: Address;
  if (!strategyAddress) {
    const strategyWalletClient = await generateStrategyAccount(walletClient).then((account) =>
      createWalletClient({
        account,
        chain: walletClient.chain,
        transport: http(),
      })
    );
    strategyAddr = strategyWalletClient.account.address;
  } else {
    strategyAddr = strategyAddress;
  }
  const gas = gasAmount ?? STRATEGY_WALLET_GAS_TARGET;
  const gasBalance = await getBalance(walletClient, { address: strategyAddr });
  const gasPrice = await getGasPrice(walletClient.chain?.id);
  if (gasBalance < gas * gasPrice) {
    setCurrentPhaseKey('pages.strategies.enter.phases.funding');
    const tx0 = await sendTransactionAsync({
      account: walletClient.account,
      chainId: walletClient.chain?.id,
      to: strategyAddr,
      value: 2n * gas * gasPrice,
    }).catch((error) => {
      throw new Error(error.shortMessage);
    });
    const receipt = await waitForTransactionReceipt(walletClient, {
      hash: tx0,
      timeout: isMultisigAddress ? MULTISIG_ADDRESS_TIMEOUT : NORMAL_ADDRESS_TIMEOUT,
    });
    return { hash: receipt?.transactionHash };
  } else {
    return { hash: undefined };
  }
}
