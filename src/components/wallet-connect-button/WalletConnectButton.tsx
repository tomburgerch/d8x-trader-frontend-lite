import { PerpetualDataHandler, TraderInterface } from '@d8x/perpetuals-sdk';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { memo, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useChainId, useConnect, useProvider } from 'wagmi';

import { Button } from '@mui/material';
import { ToastContent } from 'components/toast-content/ToastContent';
import { useAtom } from 'jotai';
import { traderAPIAtom } from 'store/pools.store';

export const WalletConnectButton = memo(() => {
  const [traderAPI, setTraderAPI] = useAtom(traderAPIAtom);

  const traderAPIRef = useRef(traderAPI);
  const loadingAPIRef = useRef(false);

  const chainId = useChainId();
  const provider = useProvider();
  const { isConnected, isReconnecting, isDisconnected } = useAccount();
  const { error: errorMessage } = useConnect();

  const unloadTraderAPI = useCallback(() => {
    if (!traderAPIRef.current) {
      return;
    }
    setTraderAPI(null);
  }, [setTraderAPI]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(
        <ToastContent title="Connection error" bodyLines={[{ label: 'Reason', value: errorMessage.message }]} />
      );
      unloadTraderAPI();
    }
  }, [errorMessage, unloadTraderAPI]);

  useEffect(() => {
    if (isDisconnected || isReconnecting || traderAPIRef.current) {
      unloadTraderAPI();
    }
  }, [isDisconnected, isReconnecting, unloadTraderAPI]);

  useEffect(() => {
    if (loadingAPIRef.current || !isConnected || !provider || !chainId) {
      return;
    }
    setTraderAPI(null);
    console.log(`reloading SDK on chainId ${chainId}`);
    loadingAPIRef.current = true;
    const newTraderAPI = new TraderInterface(PerpetualDataHandler.readSDKConfig(chainId));
    // console.log(`proxy ${newTraderAPI.getProxyAddress()}`);
    newTraderAPI
      .createProxyInstance(provider)
      .then(() => {
        setTraderAPI(newTraderAPI);
        loadingAPIRef.current = false;
        console.log(`SDK loaded on chain id ${chainId}`);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.log('error in createProxyInstance()', error);
        setTraderAPI(null);
        loadingAPIRef.current = false;
      });
  }, [isConnected, provider, chainId, setTraderAPI]);

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
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button onClick={openChainModal} style={{ display: 'flex', alignItems: 'center' }} variant="outlined">
                    {/* {chain.hasIcon && (
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
                    )} */}
                    {chain.name}
                  </Button>

                  <Button onClick={openAccountModal} variant="primary">
                    {account.displayName}
                    {/* {account.displayBalance ? ` (${account.displayBalance})` : ''} */}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
});
