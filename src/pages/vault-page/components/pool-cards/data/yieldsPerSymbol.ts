import { DataItemI } from './types';

export const yieldsPerSymbol: Record<string, DataItemI[]> = {
  STUSD: [
    {
      label: 'stUSD Yield',
      translationKey: 'stusd-yield',
    },
  ],
  WEETH: [
    {
      label: 'weETH Staking Yield',
      translationKey: 'weeth-yield',
    },
    {
      label: 'Ether.fi Points',
      translationKey: 'ether-fi-points',
    },
    {
      label: 'EigenLayer Points',
      translationKey: 'eigen-layer-points',
    },
  ],
};
