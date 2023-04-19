import { Signer } from '@ethersproject/abstract-signer';
import { Contract, ContractTransaction } from '@ethersproject/contracts';
import { CancelOrderResponseI } from 'types/types';

export function cancelOrder(
  signer: Signer,
  signature: string,
  data: CancelOrderResponseI,
  orderId: string
): Promise<ContractTransaction> {
  const contract = new Contract(data.OrderBookAddr, [data.abi], signer);
  return contract.cancelOrder(orderId, signature, data.priceUpdate.updateData, data.priceUpdate.publishTimes, {
    gasLimit: 500_000,
    value: data.priceUpdate.updateFee,
  });
}
