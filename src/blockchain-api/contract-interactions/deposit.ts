import { ethers, Contract, BigNumber } from 'ethers';

import { CollateralChangeResponseI } from 'types/types';

export function deposit(signer: ethers.providers.JsonRpcSigner, data: CollateralChangeResponseI) {
  const contract = new Contract(data.proxyAddr, [data.abi], signer);
  return contract.deposit(
    data.perpId, 
    BigNumber.from(data.amountHex), 
    data.priceUpdates.updateData, 
    data.priceUpdates.publishTimes, 
    { gasLimit: 1_000_000, value: data.priceUpdates.updateFee }
  );
}
