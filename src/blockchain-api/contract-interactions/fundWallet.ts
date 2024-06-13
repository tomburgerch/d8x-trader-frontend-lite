import { type Config } from '@wagmi/core';
import { type SendTransactionMutateAsync } from '@wagmi/core/query';
import { Address, WalletClient } from 'viem';
import { getBalance, waitForTransactionReceipt } from 'viem/actions';

import { getGasPrice } from 'blockchain-api/getGasPrice';

const GAS_TARGET = 2_000_000n; // good for arbitrum

export async function fundWallet(
  { walletClient, address, gasAmount }: { walletClient: WalletClient; address: Address; gasAmount?: bigint },
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
    return waitForTransactionReceipt(walletClient, { hash: tx0 });
  }
}
