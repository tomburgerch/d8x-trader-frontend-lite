import { ConnectButton } from '@rainbow-me/rainbowkit';
import { memo } from 'react';
import { useProvider } from 'wagmi';
import { useEffect } from 'react';
import { TraderInterface, PerpetualDataHandler } from '@d8x/perpetuals-sdk';

import { Button } from '@mui/material';
import { traderAPIAtom } from 'store/pools.store';
import { useAtom } from 'jotai';

export const WalletConnectButton = memo(() => {
  const [, setTraderAPI] = useAtom(traderAPIAtom);
  const provider = useProvider();

  useEffect(() => {
    provider
      .getNetwork()
      .then((network) => {
        const freshTraderAPI = new TraderInterface(PerpetualDataHandler.readSDKConfig(network.chainId));
        freshTraderAPI
          .createProxyInstance(provider)
          .then(() => {
            setTraderAPI(freshTraderAPI);
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((error: any) => {
            // error connecting to network through SDK
            console.log(error);
            // throw new Error(error);
          });
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        // error getting network from provider
        console.log(error);
        // throw new Error(error);
      });
  }, [provider, setTraderAPI]);

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
