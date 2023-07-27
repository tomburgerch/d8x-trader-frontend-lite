import { useAtom } from 'jotai';
import { useMemo } from 'react';

import { useMediaQuery, useTheme } from '@mui/material';

import type { StatDataI } from 'components/stats-line/types';
import { StatsLine } from 'components/stats-line/StatsLine';
import { StatsLineMobile } from 'components/stats-line/StatsLineMobile';
import { perpetualStatisticsAtom } from 'store/pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';

export const PerpetualStats = () => {
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);

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
        grouped: true,
        columnNr: 1,
      },
      {
        id: 'indexPrice',
        label: 'Index Price',
        value: perpetualStatistics
          ? formatToCurrency(perpetualStatistics.indexPrice, perpetualStatistics.quoteCurrency, true)
          : '--',
        grouped: true,
        columnNr: 1,
      },
      {
        id: 'fundingRate',
        label: 'Funding Rate',
        value: perpetualStatistics ? `${(perpetualStatistics.currentFundingRateBps / 100).toFixed(2)} %` : '--',
        grouped: true,
        columnNr: 2,
      },
      {
        id: 'openInterestBC',
        label: 'Open Interest',
        value: perpetualStatistics
          ? formatToCurrency(perpetualStatistics.openInterestBC, perpetualStatistics.baseCurrency, true)
          : '--',
        grouped: true,
        columnNr: 2,
      },
    ],
    [perpetualStatistics]
  );

  if (isMobileScreen) {
    return <StatsLineMobile items={items} />;
  }

  return <StatsLine items={items} />;
};
