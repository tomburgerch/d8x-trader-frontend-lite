import { CandlestickSeries, Chart } from 'lightweight-charts-react-wrapper';
import { CrosshairMode, ISeriesApi } from 'lightweight-charts';
import { memo, Ref } from 'react';

import { TvChartCandleI } from 'types/types';

interface CandlesSeriesPropsI {
  width?: number;
  candles: TvChartCandleI[];
  seriesRef: Ref<ISeriesApi<'Candlestick'>> | undefined;
}

export const ChartBlock = memo(({ width, candles, seriesRef }: CandlesSeriesPropsI) => {
  return (
    <Chart
      width={width}
      height={Math.round(Math.min(Math.max((width || 450) * 0.5, 300), 450))}
      crosshair={{ mode: CrosshairMode.Normal }}
      timeScale={{ timeVisible: true, barSpacing: candles.length < 60 ? 22 : 8 }}
    >
      <CandlestickSeries key={candles.length} data={candles} reactive={true} ref={seriesRef} />
    </Chart>
  );
});
