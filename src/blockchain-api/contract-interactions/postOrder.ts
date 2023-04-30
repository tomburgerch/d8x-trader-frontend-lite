import { Signer } from '@ethersproject/abstract-signer';
import { Contract, ContractTransaction } from '@ethersproject/contracts';
import { OrderDigestI } from 'types/types';
// import { TraderInterface } from '@d8x/perpetuals-sdk';

export function postOrder(signer: Signer, signatures: string[], data: OrderDigestI): Promise<ContractTransaction> {
  const abi = typeof data.abi === 'string' ? [data.abi] : data.abi;
  const contract = new Contract(data.OrderBookAddr, abi, signer);
  // const obOrders = TraderInterface.chainOrders(data.SCOrders, data.orderIds);
  return contract.postOrders([], signatures, { gasLimit: 2_000_000 });
}
