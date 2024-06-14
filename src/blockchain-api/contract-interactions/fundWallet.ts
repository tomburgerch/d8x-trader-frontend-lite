import { type Config } from '@wagmi/core';
import { type SendTransactionMutateAsync } from '@wagmi/core/query';
import { Address, WalletClient } from 'viem';
import { getBalance, waitForTransactionReceipt } from 'viem/actions';

import { MULTISIG_ADDRESS_TIMEOUT, NORMAL_ADDRESS_TIMEOUT } from 'blockchain-api/constants';
import { getGasPrice } from 'blockchain-api/getGasPrice';

const GAS_TARGET = 2_000_000n; // good for arbitrum

interface FundWalletPropsI {
  walletClient: WalletClient;
  address: Address;
  isMultisigAddress: boolean | null;
  gasAmount?: bigint;
}

export async function fundWallet(
  { walletClient, address, isMultisigAddress, gasAmount }: FundWalletPropsI,
  sendTransactionAsync: SendTransactionMutateAsync<Config, unknown>
) {
  if (!walletClient.account?.address) {
    throw new Error('Account not connected');
  }
  const gas = gasAmount ?? GAS_TARGET;
  const gasBalance = await getBalance(walletClient, { address });
  const gasPrice = await getGasPrice(walletClient.chain?.id);
  if (gasBalance < gas * gasPrice) {
    const tx0 = await sendTransactionAsync({
      account: walletClient.account,
      chainId: walletClient.chain?.id,
      to: address,
      value: 2n * gas * gasPrice,
      gas,
    }).catch((error) => {
      throw new Error(error.shortMessage);
    });
    return waitForTransactionReceipt(walletClient, {
      hash: tx0,
      timeout: isMultisigAddress ? MULTISIG_ADDRESS_TIMEOUT : NORMAL_ADDRESS_TIMEOUT,
    });
  }
}
