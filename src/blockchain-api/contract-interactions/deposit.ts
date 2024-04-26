import { PROXY_ABI } from '@d8x/perpetuals-sdk';
import type { Address, WalletClient } from 'viem';

import type { CollateralChangeResponseI } from 'types/types';
import { getGasPrice } from 'blockchain-api/getGasPrice';
import { estimateContractGas } from 'viem/actions';
import { getGasLimit } from 'blockchain-api/getGasLimit';
import { MethodE } from 'types/enums';

export async function deposit(
  walletClient: WalletClient,
  traderAddr: Address,
  data: CollateralChangeResponseI
): Promise<{ hash: Address }> {
  if (!walletClient.account) {
    throw new Error('account not connected');
  }
  const gasPrice = await getGasPrice(walletClient.chain?.id);
  const params = {
    chain: walletClient.chain,
    address: data.proxyAddr as Address,
    abi: PROXY_ABI,
    functionName: 'deposit',
    args: [data.perpId, traderAddr, +data.amountHex, data.priceUpdate.updateData, data.priceUpdate.publishTimes],
    gasPrice: gasPrice,
    value: BigInt(data.priceUpdate.updateFee),
    account: walletClient.account,
  };
  const gasLimit = await estimateContractGas(walletClient, params)
    .then((gas) => (gas * 130n) / 100n)
    .catch(() => getGasLimit({ chainId: walletClient?.chain?.id, method: MethodE.Interact }));
  return walletClient.writeContract({ ...params, gas: gasLimit }).then((tx) => ({ hash: tx }));
}
