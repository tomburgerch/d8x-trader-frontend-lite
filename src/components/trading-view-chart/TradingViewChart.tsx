import { useAtom } from 'jotai';
import { CrosshairMode, ISeriesApi } from 'lightweight-charts';
import { Chart, CandlestickSeries } from 'lightweight-charts-react-wrapper';
import { useEffect, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';

import { Box } from '@mui/material';

import { candlesAtom, newCandlesAtom } from 'store/tv-chart.store';

import { PeriodSelector } from './elements/period-selector/PeriodSelector';

import styles from './TradingViewChart.module.scss';

export const TradingViewChart = () => {
  const [candles] = useAtom(candlesAtom);
  const [newCandles, setNewCandles] = useAtom(newCandlesAtom);

  const series = useRef<ISeriesApi<'Candlestick'>>(null);

  const { width, ref } = useResizeDetector();

  useEffect(() => {
    if (newCandles.length === 0) {
      return;
    }

    newCandles.forEach((newCandle) => series.current?.update(newCandle));
    setNewCandles((prevData) => prevData.slice(newCandles.length));
  }, [newCandles, setNewCandles]);

  return (
    <Box className={styles.root} ref={ref}>
      <Chart
        width={width}
        height={Math.round(Math.max((width || 450) * 0.5, 300))}
        crosshair={{ mode: CrosshairMode.Normal }}
        autoSize={true}
        timeScale={{ timeVisible: true, barSpacing: 22 }}
      >
        <CandlestickSeries data={candles} reactive={true} ref={series} />
      </Chart>
      <Box className={styles.periodsHolder}>
        <PeriodSelector />
      </Box>
    </Box>
  );
};
