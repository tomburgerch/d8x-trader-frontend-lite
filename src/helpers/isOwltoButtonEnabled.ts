import { config } from 'config';

export function isOwltoButtonEnabled(chainId?: number) {
  if (chainId && config.enabledOwltoByChains.length > 0) {
    return config.enabledOwltoByChains.includes(chainId);
  }
  return false;
}
