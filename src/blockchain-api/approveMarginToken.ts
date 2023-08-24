import { readContract, waitForTransaction } from '@wagmi/core';
import type { Account, Transport, WalletClient } from 'viem';
import { parseUnits } from 'viem';
import { erc20ABI, type Chain } from 'wagmi';

import { MaxUint256 } from 'app-constants';
import type { AddressT } from 'types/types';

export function approveMarginToken(
  walletClient: WalletClient<Transport, Chain, Account>,
  marginTokenAddr: string,
  proxyAddr: string,
  minAmount: number,
  decimals: number
) {
  const minAmountBN = parseUnits((4 * minAmount).toFixed(decimals), decimals);
  return readContract({
    address: marginTokenAddr as AddressT,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [walletClient.account.address, proxyAddr as AddressT],
  }).then((allowance) => {
    if (allowance > minAmountBN) {
      return Promise.resolve(null);
    } else {
      const account = walletClient.account?.address;
      if (!account) {
        throw new Error('account not connected');
      }
      return walletClient
        .writeContract({
          chain: walletClient.chain,
          address: marginTokenAddr as AddressT,
          abi: erc20ABI,
          functionName: 'approve',
          args: [proxyAddr as AddressT, BigInt(MaxUint256)],
          gas: BigInt(100_000),
          account: account,
        })
        .then((tx) => {
          waitForTransaction({
            hash: tx,
            timeout: 30_000,
          }).then(() => ({ hash: tx }));
        });
    }
  });
}
