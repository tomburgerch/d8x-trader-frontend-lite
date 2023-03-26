import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import type {
  MarginAccountI,
  PerpetualOpenOrdersI,
  PerpetualStatisticsI,
  PerpetualStaticInfoI,
  PoolI,
  OrderI,
} from 'types/types';

export const poolsAtom = atom<PoolI[]>([]);
export const poolFeeAtom = atom<number>(0);
export const oracleFactoryAddrAtom = atom('');
export const proxyAddrAtom = atom('');
export const perpetualStatisticsAtom = atom<PerpetualStatisticsI | null>(null);
export const perpetualStaticInfoAtom = atom<PerpetualStaticInfoI | null>(null);
export const newPositionRiskAtom = atom<MarginAccountI | null>(null);
export const webSocketReadyAtom = atom(false);
export const loyaltyScoreAtom = atom(0);

const perpetualsStatsAtom = atom<Record<string, MarginAccountI>>({});
const ordersAtom = atom<Record<string, OrderI>>({});

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
    // Clear data about previous stats and orders
    set(perpetualsStatsAtom, {});
    set(ordersAtom, {});
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

export const positionsAtom = atom(
  (get) => {
    const perpetualsStats = get(perpetualsStatsAtom);
    return Object.values(perpetualsStats).filter(({ side }) => side !== 'CLOSED');
  },
  (_get, set, perpetualInfo: MarginAccountI) => {
    set(perpetualsStatsAtom, (prev) => ({
      ...prev,
      [perpetualInfo.symbol]: perpetualInfo,
    }));
  }
);

export const openOrdersAtom = atom(
  (get) => {
    const orders = get(ordersAtom);
    return Object.entries(orders).map(([key, value]) => ({ id: key, ...value }));
  },
  (_get, set, openOrders: PerpetualOpenOrdersI) => {
    set(ordersAtom, (prev) => {
      const updatedOpenOrders = { ...prev };
      openOrders.orderIds?.forEach((orderId, index) => (updatedOpenOrders[orderId] = openOrders.orders[index]));
      return updatedOpenOrders;
    });
  }
);

export const removeOpenOrderAtom = atom(null, (get, set, orderIdToRemove: string) => {
  set(ordersAtom, (prev) => {
    const updatedOpenOrders = { ...prev };
    delete updatedOpenOrders[orderIdToRemove];
    return updatedOpenOrders;
  });
});

export const failOrderAtom = atom(null, (get, set, orderIdToUpdate: string) => {
  set(ordersAtom, (prev) => {
    const updatedOpenOrders = { ...prev };
    updatedOpenOrders[orderIdToUpdate].deadline = -1;
    return updatedOpenOrders;
  });
});

export const clearOpenOrdersAtom = atom(null, (get, set) => {
  set(ordersAtom, {});
});
