import { ethers, Contract } from 'ethers';

import { CancelOrderResponseI } from 'types/types';

export function cancelOrder(
  signer: ethers.providers.JsonRpcSigner,
  signature: string,
  data: CancelOrderResponseI,
  orderId: string
) {
  const contract = new Contract(data.OrderBookAddr, [data.abi], signer);
  return contract.cancelOrder(
    orderId, 
    signature, 
    data.priceUpdate.updateData,
    data.priceUpdate.publishTimes,
    { 
      gasLimit: 1_000_000, value: 
      data.priceUpdate.updateFee 
  });
}
