import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';

import type { StatDataI } from 'components/stats-line/types';
import { StatsLine } from 'components/stats-line/StatsLine';
import { perpetualStatisticsAtom } from 'store/pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';

export const PerpetualStats = () => {
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);

  useEffect(() => {
    if (perpetualStatistics) {
      document.title = formatToCurrency(
        perpetualStatistics.midPrice,
        `${perpetualStatistics.baseCurrency}-${perpetualStatistics.quoteCurrency} | D8X`,
        true
      );
    }
  }, [perpetualStatistics]);

  const items: StatDataI[] = useMemo(
    () => [
      {
        id: 'midPrice',
        label: 'Mid Price',
        value: perpetualStatistics
          ? formatToCurrency(perpetualStatistics.midPrice, perpetualStatistics.quoteCurrency, true)
          : '--',
      },
      {
        id: 'markPrice',
        label: 'Mark Price',
        value: perpetualStatistics
          ? formatToCurrency(perpetualStatistics.markPrice, perpetualStatistics.quoteCurrency, true)
          : '--',
      },
      {
        id: 'indexPrice',
        label: 'Index Price',
        value: perpetualStatistics
          ? formatToCurrency(perpetualStatistics.indexPrice, perpetualStatistics.quoteCurrency, true)
          : '--',
      },
      {
        id: 'fundingRate',
        label: 'Funding Rate',
        value: perpetualStatistics ? `${(perpetualStatistics.currentFundingRateBps / 100).toFixed(2)} %` : '--',
      },
      {
        id: 'openInterestBC',
        label: 'Open Interest',
        value: perpetualStatistics
          ? formatToCurrency(perpetualStatistics.openInterestBC, perpetualStatistics.baseCurrency, true)
          : '--',
      },
    ],
    [perpetualStatistics]
  );

  return <StatsLine items={items} />;
};
