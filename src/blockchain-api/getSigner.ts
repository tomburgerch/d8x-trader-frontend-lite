import { ethers } from 'ethers';

export function getSigner() {
  const ethereum = window.ethereum;
  const provider = new ethers.providers.Web3Provider(ethereum);
  return provider.getSigner();
}
