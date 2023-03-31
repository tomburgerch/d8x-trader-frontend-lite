import { PerpetualDataHandler, TraderInterface } from '@d8x/perpetuals-sdk';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { memo, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useConnect, useProvider } from 'wagmi';

import { Button } from '@mui/material';
import { ToastContent } from 'components/toast-content/ToastContent';
import { ethers } from 'ethers';
import { useAtom } from 'jotai';
import { proxyABIAtom, traderAPIAtom } from 'store/pools.store';

export const WalletConnectButton = memo(() => {
  const [traderAPI, setTraderAPI] = useAtom(traderAPIAtom);
  const [, setProxyABI] = useAtom(proxyABIAtom);
  const traderAPIRef = useRef(traderAPI);

  const provider = useProvider();
  const { isConnected, isReconnecting, isDisconnected } = useAccount();
  const { error: errorMessage } = useConnect();

  // init SDK API --> calls will be done via trader's connected wallet
  const loadTraderAPI = useCallback(
    (loadProvider: ethers.providers.Provider) => {
      loadProvider
        .getNetwork()
        .then((network) => {
          console.log('network fetched through provider');
          const freshTraderAPI = new TraderInterface(PerpetualDataHandler.readSDKConfig(network.chainId));
          freshTraderAPI
            .createProxyInstance(loadProvider)
            .then(() => {
              console.log('proxy instance created');
              setProxyABI(freshTraderAPI.getABI('proxy') as string[] | undefined);
              setTraderAPI(freshTraderAPI);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((error: any) => {
              // error connecting to network through SDK
              console.log('error in createProxyInstance()', error);
              setTraderAPI(null);
            });
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          // error getting network from provider
          console.log('error in getNetwork()', error);
          setTraderAPI(null);
        });
    },
    [setProxyABI, setTraderAPI]
  );

  // set trader API to null -> calls will be done via REST
  const unloadTraderAPI = useCallback(() => {
    if (!traderAPIRef.current) {
      // already flushed
      console.log('trader API already flushed');
      return;
    }
    setTraderAPI(null);
  }, [traderAPIRef, setTraderAPI]);

  // connection error
  useEffect(() => {
    if (errorMessage) {
      toast.error(
        <ToastContent title="Connection error" bodyLines={[{ label: 'Reason', value: errorMessage.message }]} />
      );
      unloadTraderAPI();
    }
  }, [errorMessage, unloadTraderAPI]);

  // wallet connected: use SDK
  useEffect(() => {
    if (isConnected && provider) {
      console.log('loading trader API');
      loadTraderAPI(provider);
    }
  }, [isConnected, provider, loadTraderAPI]);

  // wallet disconnected or reconnecting: use REST
  useEffect(() => {
    if (isDisconnected || isReconnecting) {
      console.log('flushing trader API');
      unloadTraderAPI();
    }
  }, [isDisconnected, isReconnecting, unloadTraderAPI]);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} variant="primary">
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="warning">
                    Wrong network
                  </Button>
                );
              }

              return (
                <>
                  {/*}
                  <Button onClick={openChainModal} style={{ display: 'flex', alignItems: 'center' }} variant="primary">
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} style={{ width: 12, height: 12 }} />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>
                  {*/}

                  <Button onClick={openAccountModal} variant="primary">
                    {account.displayName}
                  </Button>
                </>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
});
