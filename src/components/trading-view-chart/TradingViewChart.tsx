import { useAtom } from 'jotai';
import { ISeriesApi } from 'lightweight-charts';
import { memo, useEffect, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';

import { Box, CircularProgress } from '@mui/material';

import { candlesAtom, candlesDataReadyAtom, newCandlesAtom } from 'store/tv-chart.store';

import { ChartBlock } from './elements/chart-block/ChartBlock';
import { PeriodSelector } from './elements/period-selector/PeriodSelector';

import styles from './TradingViewChart.module.scss';

export const TradingViewChart = memo(() => {
  const [candles] = useAtom(candlesAtom);
  const [newCandles, setNewCandles] = useAtom(newCandlesAtom);
  const [isCandleDataReady] = useAtom(candlesDataReadyAtom);

  const seriesRef = useRef<ISeriesApi<'Candlestick'>>(null);

  const { width, ref } = useResizeDetector();

  useEffect(() => {
    const candlesLength = newCandles.length;
    if (candlesLength === 0 || !seriesRef.current) {
      return;
    }

    seriesRef.current.update(newCandles[candlesLength - 1]);
    setNewCandles((prevData) => prevData.slice(newCandles.length));
  }, [newCandles, setNewCandles]);

  return (
    <Box className={styles.root} ref={ref}>
      <ChartBlock width={width} candles={candles} seriesRef={seriesRef} />
      <Box className={styles.periodsHolder}>
        <PeriodSelector />
      </Box>
      {!isCandleDataReady && (
        <Box className={styles.loaderHolder}>
          <CircularProgress color="primary" />
        </Box>
      )}
    </Box>
  );
});
