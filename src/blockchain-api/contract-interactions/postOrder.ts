import { Contract, ContractTransaction, BigNumber, Signer } from 'ethers';
import { LOB_ABI } from 'blockchain-api/constants';
import { OrderDigestI } from 'types/types';
import { TraderInterface } from '@d8x/perpetuals-sdk';

// upon redeployment of backend:
// - LOB ABI should come from the BE

export function postOrder(signer: Signer, signatures: string[], data: OrderDigestI): Promise<ContractTransaction> {
  // const abi = typeof data.abi === 'string' ? [data.abi] : data.abi;
  const contract = new Contract(data.OrderBookAddr, LOB_ABI, signer);
  const obOrders = TraderInterface.chainOrders(data.SCOrders, data.orderIds);
  return contract.postOrders(obOrders, signatures, { gasLimit: BigNumber.from(3_000_000) });
}
