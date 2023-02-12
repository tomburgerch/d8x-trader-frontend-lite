import { useAtom } from 'jotai';
import { useCallback } from 'react';

import { perpetualStatisticsAtom, selectedPerpetualAtom, selectedPoolAtom } from 'store/pools.store';

import {
  CommonWsMessageI,
  // ConnectWsMessageI,
  // ErrorWsMessageI,
  MessageTypeE,
  OnUpdateMarkPriceWsMessageI,
  SubscriptionWsMessageI,
} from './types';
import { PerpetualStatisticsI } from '../../types/types';
import { parseSymbol } from '../../helpers/parseSymbol';

// function isConnectMessage(message: CommonWsMessageI): message is ConnectWsMessageI {
//   return message.type === MessageTypeE.Connect;
// }

// function isErrorMessage(message: CommonWsMessageI): message is ErrorWsMessageI {
//   return message.type === MessageTypeE.Error;
// }

function isSubscriptionMessage(message: CommonWsMessageI): message is SubscriptionWsMessageI {
  return message.type === MessageTypeE.Subscription;
}

function isUpdateMarkPriceMessage(message: CommonWsMessageI): message is OnUpdateMarkPriceWsMessageI {
  return message.type === MessageTypeE.OnUpdateMarkPrice;
}

export function useWsMessageHandler() {
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [, setPerpetualStatistics] = useAtom(perpetualStatisticsAtom);

  const updatePerpetualStats = useCallback(
    (stats: PerpetualStatisticsI) => {
      if (selectedPool && selectedPerpetual) {
        if (
          stats.baseCurrency === selectedPerpetual.baseCurrency &&
          stats.quoteCurrency === selectedPerpetual.quoteCurrency &&
          stats.poolName === selectedPool.poolSymbol
        ) {
          setPerpetualStatistics(stats);
        }
      }
    },
    [selectedPool, selectedPerpetual, setPerpetualStatistics]
  );

  return useCallback(
    (message: string) => {
      const parsedMessage = JSON.parse(message);

      if (isSubscriptionMessage(parsedMessage)) {
        const parsedSymbol = parseSymbol(parsedMessage.msg);
        if (!parsedSymbol) {
          return;
        }

        updatePerpetualStats({
          id: parsedMessage.data.id,
          baseCurrency: parsedMessage.data.baseCurrency,
          quoteCurrency: parsedMessage.data.quoteCurrency,
          poolName: parsedSymbol.poolSymbol,
          midPrice: parsedMessage.data.midPrice,
          markPrice: parsedMessage.data.markPrice,
          indexPrice: parsedMessage.data.indexPrice,
          currentFundingRateBps: parsedMessage.data.currentFundingRateBps,
          openInterestBC: parsedMessage.data.openInterestBC,
        });
      } else if (isUpdateMarkPriceMessage(parsedMessage)) {
        const parsedSymbol = parseSymbol(parsedMessage.data.obj.symbol);
        if (!parsedSymbol) {
          return;
        }

        const {
          perpetualId: id,
          midPrice,
          markPrice,
          indexPrice,
          fundingRate: currentFundingRateBps,
          openInterest: openInterestBC,
        } = parsedMessage.data.obj;

        updatePerpetualStats({
          id,
          baseCurrency: parsedSymbol.baseCurrency,
          quoteCurrency: parsedSymbol.quoteCurrency,
          poolName: parsedSymbol.poolSymbol,
          midPrice,
          markPrice,
          indexPrice,
          currentFundingRateBps,
          openInterestBC,
        });
      }
    },
    [updatePerpetualStats]
  );
}
