import { Buffer } from 'buffer';
import { ethers } from 'ethers';

export function signMessages(signer: ethers.Signer, digests: string[]) {
  const promises = [];
  for (const digest of digests) {
    const digestBuffer = Buffer.from(digest.slice(2), 'hex');
    promises.push(signer.signMessage(digestBuffer));
  }
  return Promise.all(promises);
}
