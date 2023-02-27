import { ethers } from 'ethers';

import { OrderDigestI } from 'types/types';

export function postOrder(signer: ethers.providers.JsonRpcSigner, signature: string, data: OrderDigestI) {
  const contract = new ethers.Contract(data.OrderBookAddr, [data.abi], signer);
  return contract.postOrder(data.SCOrders[0], signature, { gasLimit: 1_000_000 });
}
