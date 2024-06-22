import { config } from 'config';

export function isCedeWidgetEnabled(chainId?: number) {
  if (chainId && config.enabledCedeByChains.length > 0) {
    return config.enabledCedeByChains.includes(chainId);
  }
  return false;
}
