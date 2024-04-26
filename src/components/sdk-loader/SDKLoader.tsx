import { PerpetualDataHandler, TraderInterface } from '@d8x/perpetuals-sdk';
import { useAtomValue, useSetAtom } from 'jotai';
import { memo, useCallback, useEffect, useRef } from 'react';
import { type Client } from 'viem';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';

import { config } from 'config';
import { traderAPIAtom, traderAPIBusyAtom } from 'store/pools.store';
import { sdkConnectedAtom } from 'store/vault-pools.store';
import { activatedOneClickTradingAtom, tradingClientAtom } from 'store/app.store';

export const SDKLoader = memo(() => {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const publicClient = usePublicClient();
  const { data: walletClient, isSuccess } = useWalletClient();

  const activatedOneClickTrading = useAtomValue(activatedOneClickTradingAtom);

  const setTraderAPI = useSetAtom(traderAPIAtom);
  const setSDKConnected = useSetAtom(sdkConnectedAtom);
  const setAPIBusy = useSetAtom(traderAPIBusyAtom);
  const setTradingClient = useSetAtom(tradingClientAtom);

  const loadingAPIRef = useRef(false);

  useEffect(() => {
    if (walletClient && isSuccess && !activatedOneClickTrading) {
      setTradingClient(walletClient);
      return;
    }
  }, [isSuccess, walletClient, activatedOneClickTrading, setTradingClient]);

  const loadSDK = useCallback(
    async (_publicClient: Client, _chainId: number) => {
      if (loadingAPIRef.current) {
        return;
      }
      loadingAPIRef.current = true;
      setTraderAPI(null);
      setSDKConnected(false);
      setAPIBusy(true);
      const configSDK = PerpetualDataHandler.readSDKConfig(_chainId);
      if (config.priceFeedEndpoint[_chainId] && config.priceFeedEndpoint[_chainId] !== '') {
        const pythPriceServiceIdx = configSDK.priceFeedEndpoints?.findIndex(({ type }) => type === 'pyth');
        if (pythPriceServiceIdx !== undefined && pythPriceServiceIdx >= 0) {
          if (configSDK.priceFeedEndpoints !== undefined) {
            configSDK.priceFeedEndpoints[pythPriceServiceIdx].endpoints.push(config.priceFeedEndpoint[_chainId]);
          }
        } else {
          configSDK.priceFeedEndpoints = [{ type: 'pyth', endpoints: [config.priceFeedEndpoint[_chainId]] }];
        }
      }
      if (config.httpRPC[_chainId] && config.httpRPC[_chainId] !== '') {
        configSDK.nodeURL = config.httpRPC[_chainId];
      }
      const newTraderAPI = new TraderInterface(configSDK);
      newTraderAPI
        .createProxyInstance()
        .then(() => {
          setSDKConnected(true);
          setTraderAPI(newTraderAPI);
        })
        .catch((e) => {
          console.log('error loading SDK', e);
        })
        .finally(() => {
          setAPIBusy(false);
          loadingAPIRef.current = false;
        });
    },
    [setTraderAPI, setSDKConnected, setAPIBusy]
  );

  const unloadSDK = useCallback(() => {
    setSDKConnected(false);
    setAPIBusy(false);
    setTraderAPI(null);
  }, [setTraderAPI, setSDKConnected, setAPIBusy]);

  // disconnect SDK on wallet disconnected
  useEffect(() => {
    if (!isConnected) {
      unloadSDK();
    }
  }, [isConnected, unloadSDK]);

  // connect SDK on change of provider/chain/wallet
  useEffect(() => {
    if (loadingAPIRef.current || !publicClient || !chainId) {
      return;
    }
    unloadSDK();
    loadSDK(publicClient, chainId).then().catch(console.error);
  }, [isConnected, publicClient, chainId, loadSDK, unloadSDK]);

  return null;
});
