import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import type { PoolI } from 'types/types';
import { PerpetualStatisticsI } from 'types/types';

export const poolsAtom = atom<PoolI[]>([]);
export const oracleFactoryAddrAtom = atom('');
export const perpetualStatisticsAtom = atom<PerpetualStatisticsI | null>(null);

const selectedPoolNameLSAtom = atomWithStorage<string>('d8x_selectedPoolName', '');

export const selectedPoolAtom = atom(
  (get) => {
    const allPools = get(poolsAtom);
    if (allPools.length === 0) {
      return null;
    }

    const savedPoolName = get(selectedPoolNameLSAtom);
    const foundPool = allPools.find((pool) => pool.poolSymbol === savedPoolName);
    if (foundPool) {
      return foundPool;
    }

    return allPools[0];
  },
  (get, set, newPool: string) => {
    set(selectedPoolNameLSAtom, newPool);
  }
);

const selectedPerpetualIdLSAtom = atomWithStorage<number>('d8x_selectedPerpetualName', 0);

export const selectedPerpetualAtom = atom(
  (get) => {
    const selectedPool = get(selectedPoolAtom);
    if (!selectedPool) {
      return null;
    }

    const perpetuals = selectedPool.perpetuals;
    if (perpetuals.length === 0) {
      return null;
    }

    const savedPerpetualId = get(selectedPerpetualIdLSAtom);
    const foundPerpetual = perpetuals.find((perpetual) => perpetual.id === +savedPerpetualId);
    if (foundPerpetual) {
      return foundPerpetual;
    }

    return perpetuals[0];
  },
  (get, set, perpetualId: number) => {
    set(selectedPerpetualIdLSAtom, perpetualId);
  }
);
