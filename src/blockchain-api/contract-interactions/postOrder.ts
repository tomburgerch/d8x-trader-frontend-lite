import { ethers, Contract } from 'ethers';
import { LOB_ABI } from 'blockchain-api/constants';
import { OrderDigestI } from 'types/types';

export function postOrder(signer: ethers.Signer, signatures: string[], data: OrderDigestI) {
  const contract = new Contract(data.OrderBookAddr, LOB_ABI, signer);
  return contract.postOrders(data.SCOrders, signatures, {gasLimit: 3_000_000});
}
