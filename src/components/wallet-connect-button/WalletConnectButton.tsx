import { ConnectButton } from '@rainbow-me/rainbowkit';

import { Button } from '@mui/material';
import { memo } from 'react';

export const WalletConnectButton = memo(() => {
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
