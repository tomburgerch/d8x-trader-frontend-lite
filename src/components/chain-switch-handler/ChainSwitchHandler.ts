import { useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import {
  clearOpenOrdersAtom,
  clearPositionsAtom,
  fundingListAtom,
  perpetualStatisticsAtom,
  poolsAtom,
  selectedPerpetualAtom,
  selectedPoolAtom,
  tradesHistoryAtom,
} from 'store/pools.store';

export const ChainSwitchHandler = () => {
  const setSelectedPool = useSetAtom(selectedPoolAtom);
  const setSelectedPerpetual = useSetAtom(selectedPerpetualAtom);
  const setPerpetualStatistics = useSetAtom(perpetualStatisticsAtom);
  const setPools = useSetAtom(poolsAtom);
  const clearPositions = useSetAtom(clearPositionsAtom);
  const clearOpenOrders = useSetAtom(clearOpenOrdersAtom);
  const setFundingList = useSetAtom(fundingListAtom);
  const setTradesHistory = useSetAtom(tradesHistoryAtom);

  const location = useLocation();
  const navigate = useNavigate();

  const { isConnected, isReconnecting, chainId } = useAccount();

  const chainIdRef = useRef<number | null>();

  useEffect(() => {
    if (isReconnecting || !isConnected) {
      chainIdRef.current = null;
      return;
    }

    if (chainIdRef.current !== chainId) {
      if (chainIdRef.current !== null) {
        setPools([]);
        clearPositions();
        clearOpenOrders();
        setFundingList([]);
        setTradesHistory([]);
        setSelectedPool('');
        setSelectedPerpetual(0);
        setPerpetualStatistics(null);

        // Clear URL params
        navigate(`${location.pathname}${location.search}`);
      }

      chainIdRef.current = chainId;
    }
  }, [
    isConnected,
    isReconnecting,
    chainId,
    setPools,
    clearPositions,
    clearOpenOrders,
    setFundingList,
    setTradesHistory,
    setSelectedPool,
    setSelectedPerpetual,
    setPerpetualStatistics,
    navigate,
    location.pathname,
    location.search,
  ]);

  return null;
};
