import { LOB_ABI, TraderInterface } from '@d8x/perpetuals-sdk';
import type { Address, WalletClient } from 'viem';
import { type OrderDigestI } from 'types/types';
import { getGasPrice } from 'blockchain-api/getGasPrice';
import { estimateContractGas } from 'viem/actions';

import { getGasLimit } from 'blockchain-api/getGasLimit';
import { MethodE } from 'types/enums';
import { orderSubmitted } from 'network/broker';

export async function postOrder(
  walletClient: WalletClient,
  signatures: string[],
  data: OrderDigestI,
  doChain = true
): Promise<{ hash: Address }> {
  let orders: never[];
  if (doChain) {
    orders = TraderInterface.chainOrders(data.SCOrders, data.orderIds).map(
      TraderInterface.fromClientOrderToTypeSafeOrder
    ) as never[];
  } else {
    orders = data.SCOrders.map((o) => TraderInterface.fromSmartContratOrderToClientOrder(o)).map(
      TraderInterface.fromClientOrderToTypeSafeOrder
    ) as never[];
  }
  if (!walletClient.account || walletClient?.chain === undefined) {
    throw new Error('account not connected');
  }
  const chain = walletClient.chain;
  const gasPrice = await getGasPrice(chain.id);
  const params = {
    chain,
    address: data.OrderBookAddr as Address,
    abi: LOB_ABI,
    functionName: 'postOrders',
    args: [orders, signatures],
    account: walletClient.account,
    gasPrice: gasPrice,
  };

  const gasLimit = await estimateContractGas(walletClient, params)
    .then((gas) => (gas * 150n) / 100n)
    .catch(() => getGasLimit({ chainId: chain.id, method: MethodE.Interact }) * BigInt(orders.length));
  return walletClient.writeContract({ ...params, gas: gasLimit }).then((tx) => {
    // success submitting order to the node - inform backend
    orderSubmitted(chain.id, data.orderIds).then().catch(console.error);
    return { hash: tx };
  });
}
