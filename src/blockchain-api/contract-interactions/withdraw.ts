import { PROXY_ABI } from '@d8x/perpetuals-sdk';
import type { Account, Address, Transport, WalletClient } from 'viem';
import type { Chain } from 'wagmi';

import type { CollateralChangeResponseI } from 'types/types';

export function withdraw(
  walletClient: WalletClient<Transport, Chain, Account>,
  data: CollateralChangeResponseI
): Promise<{ hash: Address }> {
  const account = walletClient.account?.address;
  if (!account) {
    throw new Error('account not connected');
  }
  return walletClient
    .writeContract({
      chain: walletClient.chain,
      address: data.proxyAddr as Address,
      abi: PROXY_ABI,
      functionName: 'withdraw',
      args: [data.perpId, +data.amountHex, data.priceUpdate.updateData, data.priceUpdate.publishTimes],
      gas: BigInt(1_000_000),
      value: BigInt(data.priceUpdate.updateFee),
      account: account,
    })
    .then((tx) => ({ hash: tx }));
}
