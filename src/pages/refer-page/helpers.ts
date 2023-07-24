import { getReferralCodeExists } from 'network/referral';

export async function checkCodeExists(chainId: number, value: string) {
  const codeExistsResponse = await getReferralCodeExists(chainId, value);
  return !codeExistsResponse.data.length ? false : true;
}
