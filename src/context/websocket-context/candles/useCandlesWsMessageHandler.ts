import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { UTCTimestamp } from 'lightweight-charts';

import { selectedPerpetualAtom } from 'store/pools.store';
import { candlesAtom, candlesWebSocketReadyAtom, newCandlesAtom, selectedPeriodAtom } from 'store/tv-chart.store';
import { PerpetualI } from 'types/types';
import { TvChartPeriodE } from 'types/enums';

import {
  CommonWsMessageI,
  ConnectWsMessageI,
  // ErrorWsMessageI,
  MessageTypeE,
  SubscribeWsMessageI,
  UpdateWsMessageI,
} from './types';

function isConnectMessage(message: CommonWsMessageI): message is ConnectWsMessageI {
  return message.type === MessageTypeE.Connect;
}

// function isErrorMessage(message: CommonWsMessageI): message is ErrorWsMessageI {
//   return message.type === MessageTypeE.Error;
// }

function isSubscribeMessage(message: CommonWsMessageI): message is SubscribeWsMessageI {
  return message.type === MessageTypeE.Subscribe;
}

function isUpdateMessage(message: UpdateWsMessageI): message is UpdateWsMessageI {
  return message.type === MessageTypeE.Update;
}

function createPairWithPeriod(perpetual: PerpetualI, period: TvChartPeriodE) {
  return `${perpetual.baseCurrency}-${perpetual.quoteCurrency}:${period}`.toLowerCase();
}

export function useCandlesWsMessageHandler() {
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [selectedPeriod] = useAtom(selectedPeriodAtom);
  const [, setCandlesWebSocketReady] = useAtom(candlesWebSocketReadyAtom);
  const [, setCandles] = useAtom(candlesAtom);
  const [, setNewCandles] = useAtom(newCandlesAtom);

  return useCallback(
    (message: string) => {
      const parsedMessage = JSON.parse(message);

      if (isConnectMessage(parsedMessage)) {
        setCandlesWebSocketReady(true);
      } else if (isSubscribeMessage(parsedMessage) && selectedPerpetual) {
        const symbol = createPairWithPeriod(selectedPerpetual, selectedPeriod);
        if (parsedMessage.msg !== symbol) {
          return;
        }

        setCandles(
          parsedMessage.data.map((candle) => ({
            start: candle.start,
            time: (new Date(candle.time).getTime() / 1000) as UTCTimestamp,
            open: +candle.open,
            high: +candle.high,
            low: +candle.low,
            close: +candle.close,
          }))
        );
      } else if (isUpdateMessage(parsedMessage) && selectedPerpetual) {
        const symbol = createPairWithPeriod(selectedPerpetual, selectedPeriod);
        if (parsedMessage.msg !== symbol) {
          return;
        }

        setNewCandles((prevData) => {
          const newData = [...prevData];

          parsedMessage.data.forEach((newCandle) => {
            newData.push({
              start: newCandle.start,
              time: (new Date(newCandle.time).getTime() / 1000) as UTCTimestamp,
              open: +newCandle.open,
              high: +newCandle.high,
              low: +newCandle.low,
              close: +newCandle.close,
            });
          });

          return newData;
        });
      }
    },
    [setCandlesWebSocketReady, setCandles, setNewCandles, selectedPerpetual, selectedPeriod]
  );
}
