import { BigNumber, ethers } from 'ethers';

import { ERC20_ABI } from './constants';

export function approveMarginToken(signer: ethers.providers.JsonRpcSigner, marginTokenAddr: string, proxyAddr: string) {
  const marginToken: ethers.Contract = new ethers.Contract(marginTokenAddr, ERC20_ABI, signer);
  const amount = BigNumber.from(2).pow(256).sub(BigNumber.from(1));
  return marginToken.approve(proxyAddr, amount, { gasLimit: 1_000_000 });
}
