import { ethers, Contract, ContractTransaction, BigNumber } from 'ethers';
import { LOB_ABI } from 'blockchain-api/constants';
import { OrderDigestI } from 'types/types';

export function postOrder(
  signer: ethers.Signer,
  signatures: string[],
  data: OrderDigestI
): Promise<ContractTransaction> {
  // const abi = typeof data.abi === 'string' ? [data.abi] : data.abi;
  const contract = new Contract(data.OrderBookAddr, LOB_ABI, signer);
  // console.log(abi);
  console.log(data.SCOrders);
  return contract.postOrders(data.SCOrders, signatures, { gasLimit: BigNumber.from(3_000_000) });
}
