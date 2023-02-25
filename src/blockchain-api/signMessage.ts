import { Buffer } from 'buffer';
import { ethers } from 'ethers';

export function signMessage(signer: ethers.providers.JsonRpcSigner, digest: string) {
  const digestBuffer = Buffer.from(digest.slice(2), 'hex');
  return signer.signMessage(digestBuffer);
}
