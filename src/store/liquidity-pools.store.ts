import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import type { OpenWithdrawalI, PoolI } from 'types/types';
import { LiquidityTypeE } from '../types/enums';

export const liquidityPoolsAtom = atom<PoolI[]>([]);
export const liquidityTypeAtom = atom(LiquidityTypeE.Add);
export const withdrawalsAtom = atom<OpenWithdrawalI[]>([]);

const selectedLiquidityPoolNameLSAtom = atomWithStorage<string>('d8x_selectedLiquidityPoolName', '');

export const selectedLiquidityPoolAtom = atom(
  (get) => {
    const allPools = get(liquidityPoolsAtom);
    if (allPools.length === 0) {
      return null;
    }

    const savedPoolName = get(selectedLiquidityPoolNameLSAtom);
    const foundPool = allPools.find((pool) => pool.poolSymbol === savedPoolName);
    if (foundPool) {
      return foundPool;
    }

    return allPools[0];
  },
  (get, set, newPool: string) => {
    set(selectedLiquidityPoolNameLSAtom, newPool);
  }
);
