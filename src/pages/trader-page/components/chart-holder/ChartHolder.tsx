import { memo } from 'react';
import { useAtom } from 'jotai';

import { useMediaQuery, useTheme } from '@mui/material';

import { TradingViewChart } from 'components/trading-view-chart/TradingViewChart';
import { showChartForMobileAtom } from 'store/pools.store';

export const ChartHolder = memo(() => {
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [showChartForMobile] = useAtom(showChartForMobileAtom);

  if (isMobileScreen && !showChartForMobile) {
    return null;
  }
  return <TradingViewChart />;
});
