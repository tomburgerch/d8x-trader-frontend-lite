import { ethers, Contract, ContractTransaction } from 'ethers';

import { OrderDigestI } from 'types/types';

export function postOrder(signer: ethers.providers.JsonRpcSigner, signatures: string[], data: OrderDigestI) {
  const contract = new Contract(data.OrderBookAddr, [data.abi], signer);
  const promises: ContractTransaction[] = [];
  signatures.forEach((signature, index) => {
    promises.push(contract.postOrder(data.SCOrders[index], signature, { gasLimit: 1_000_000 }));
  });
  return Promise.all(promises);
}
