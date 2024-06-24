import { config } from 'config';

export function isLifiWidgetEnabled(isOwltoEnabled: boolean, chainId?: number) {
  if (isOwltoEnabled) {
    // disabled LiFi widget, in case OWLTO is enabled on same chain
    return false;
  }
  if (chainId && config.enabledLiFiByChains.length > 0) {
    return config.enabledLiFiByChains.includes(chainId);
  }
  return false;
}
