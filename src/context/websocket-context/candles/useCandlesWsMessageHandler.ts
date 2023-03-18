import { useAtom } from 'jotai';
import { useCallback } from 'react';

import { candlesWebSocketReadyAtom } from 'store/pools.store';

import {
  CommonWsMessageI,
  ConnectWsMessageI,
  // ErrorWsMessageI,
  MessageTypeE,
  SubscriptionWsMessageI,
  UpdateWsMessageI,
} from './types';

function isConnectMessage(message: CommonWsMessageI): message is ConnectWsMessageI {
  return message.type === MessageTypeE.Connect;
}

// function isErrorMessage(message: CommonWsMessageI): message is ErrorWsMessageI {
//   return message.type === MessageTypeE.Error;
// }

function isSubscriptionMessage(message: CommonWsMessageI): message is SubscriptionWsMessageI {
  return message.type === MessageTypeE.Subscription;
}

function isUpdateMessage(message: UpdateWsMessageI): message is UpdateWsMessageI {
  return message.type === MessageTypeE.Update;
}

export function useCandlesWsMessageHandler() {
  const [, setCandlesWebSocketReady] = useAtom(candlesWebSocketReadyAtom);

  return useCallback(
    (message: string) => {
      const parsedMessage = JSON.parse(message);

      if (isConnectMessage(parsedMessage)) {
        setCandlesWebSocketReady(true);
      } else if (isSubscriptionMessage(parsedMessage)) {
        // TODO ...
      } else if (isUpdateMessage(parsedMessage)) {
        // TODO ...
      }
    },
    [setCandlesWebSocketReady]
  );
}
