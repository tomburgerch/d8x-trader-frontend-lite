import { Address, WalletClient, WriteContractParameters, erc20Abi, parseUnits } from 'viem';
import { estimateContractGas, waitForTransactionReceipt, writeContract } from 'viem/actions';

import { MULTISIG_ADDRESS_TIMEOUT, NORMAL_ADDRESS_TIMEOUT } from 'blockchain-api/constants';
import { getGasPrice } from 'blockchain-api/getGasPrice';
import { wagmiConfig } from 'blockchain-api/wagmi/wagmiClient';
import { readContracts } from '@wagmi/core';
import { Dispatch, SetStateAction } from 'react';

interface FundMarginPropsI {
  walletClient: WalletClient;
  strategyClient: WalletClient;
  strategyAddress?: Address;
  isMultisigAddress: boolean | null;
  amount: number;
  settleTokenAddress: Address;
}

export async function fundStrategyMargin(
  { walletClient, strategyClient, strategyAddress, isMultisigAddress, amount, settleTokenAddress }: FundMarginPropsI,
  setCurrentPhaseKey: Dispatch<SetStateAction<string>>
) {
  if (!walletClient.account?.address || !strategyClient.account?.address) {
    throw new Error('Account not connected');
  }
  let strategyAddr: Address;
  if (!strategyAddress) {
    strategyAddr = strategyClient.account.address;
  } else {
    strategyAddr = strategyAddress;
  }

  const settleTokenContract = {
    address: settleTokenAddress,
    abi: erc20Abi,
    chain: walletClient.chain,
  } as const;
  const [strategyBalance, decimals] = await readContracts(wagmiConfig, {
    allowFailure: false,
    contracts: [
      {
        ...settleTokenContract,
        functionName: 'balanceOf',
        args: [strategyAddr],
      },
      {
        ...settleTokenContract,
        functionName: 'decimals',
      },
    ],
  });
  const amountBigint = parseUnits(amount.toString(), decimals);
  if (strategyBalance < amountBigint) {
    //console.log('funding strategy account');
    setCurrentPhaseKey('pages.strategies.enter.phases.funding');
    const gasPrice = await getGasPrice(walletClient.chain?.id);
    const params: WriteContractParameters = {
      ...settleTokenContract,
      functionName: 'transfer',
      args: [strategyAddr, amountBigint],
      account: walletClient.account,
      gasPrice: gasPrice,
    };
    const gas = await estimateContractGas(walletClient, params); // reverts if insufficient balance
    const tx1 = await writeContract(walletClient, { ...params, gas }).catch((error) => {
      throw new Error(error.shortMessage);
    });
    await waitForTransactionReceipt(walletClient, {
      hash: tx1,
      timeout: isMultisigAddress ? MULTISIG_ADDRESS_TIMEOUT : NORMAL_ADDRESS_TIMEOUT,
    });
    return { hash: tx1 };
  } else {
    return { hash: undefined };
  }
}
