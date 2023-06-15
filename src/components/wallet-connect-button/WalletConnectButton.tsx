import { LiquidityProviderTool, PerpetualDataHandler, TraderInterface } from '@d8x/perpetuals-sdk';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAtom } from 'jotai';
import { memo, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useChainId, useConnect, useProvider, useSigner } from 'wagmi';

import { Box, Button } from '@mui/material';

import { ReactComponent as FilledStar } from 'assets/starFilled.svg';
import { ReactComponent as EmptyStar } from 'assets/starEmpty.svg';
import { ToastContent } from 'components/toast-content/ToastContent';
import { getTraderLoyalty } from 'network/network';
import { liqProvToolAtom } from 'store/liquidity-pools.store';
import { loyaltyScoreAtom, traderAPIAtom } from 'store/pools.store';
import { cutAddressName } from 'utils/cutAddressName';

import styles from './WalletConnectButton.module.scss';

const loyaltyMap: Record<number, string> = {
  1: 'Diamond',
  2: 'Platinum',
  3: 'Gold',
  4: 'Silver',
  5: '-',
};

export const WalletConnectButton = memo(() => {
  const [traderAPI, setTraderAPI] = useAtom(traderAPIAtom);
  const [liqProvTool, setLiqProvTool] = useAtom(liqProvToolAtom);
  const [loyaltyScore, setLoyaltyScore] = useAtom(loyaltyScoreAtom);

  const { data: signer } = useSigner({
    onError(error) {
      console.log(error);
    },
  });

  const traderAPIRef = useRef(traderAPI);
  const loadingAPIRef = useRef(false);
  const liqProvToolRef = useRef(liqProvTool);
  const loadingLiqProvToolRef = useRef(false);

  const { address } = useAccount();
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

  const unloadLiqProvTool = useCallback(() => {
    if (!liqProvToolRef.current) {
      return;
    }
    setLiqProvTool(null);
  }, [setLiqProvTool]);

  useEffect(() => {
    if (address) {
      getTraderLoyalty(chainId, address).then((data) => {
        setLoyaltyScore(data.data);
      });
    } else {
      setLoyaltyScore(5);
    }
  }, [chainId, address, setLoyaltyScore]);

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
    // console.log(`reloading SDK on chainId ${chainId}`);
    loadingAPIRef.current = true;
    const newTraderAPI = new TraderInterface(PerpetualDataHandler.readSDKConfig(chainId));
    // console.log(`proxy ${newTraderAPI.getProxyAddress()}`);
    newTraderAPI
      .createProxyInstance(provider)
      .then(() => {
        setTraderAPI(newTraderAPI);
        loadingAPIRef.current = false;
        // console.log(`SDK loaded on chain id ${chainId}`);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.log(error);
        setTraderAPI(null);
        loadingAPIRef.current = false;
      });
  }, [isConnected, provider, chainId, setTraderAPI]);

  useEffect(() => {
    if (isDisconnected || isReconnecting || liqProvToolRef.current) {
      unloadLiqProvTool();
    }
  }, [isDisconnected, isReconnecting, unloadLiqProvTool]);

  useEffect(() => {
    if (loadingLiqProvToolRef.current || !chainId || !provider || !isConnected || !signer) {
      return;
    }
    setLiqProvTool(null);
    loadingLiqProvToolRef.current = true;
    const newLiqProvTool = new LiquidityProviderTool(PerpetualDataHandler.readSDKConfig(chainId), signer);
    newLiqProvTool
      .createProxyInstance(provider)
      .then(() => {
        setLiqProvTool(newLiqProvTool);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.log(error);
        setLiqProvTool(null);
      })
      .finally(() => {
        loadingLiqProvToolRef.current = false;
      });
  }, [isConnected, chainId, provider, setLiqProvTool, signer]);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              className: styles.root,
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} variant="primary">
                    Connect
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
                <div className={styles.buttonsHolder}>
                  <Button onClick={openChainModal} className={styles.chainButton} variant="primary">
                    <img src={chain.iconUrl} alt={chain.name} title={chain.name} />
                  </Button>

                  <Button onClick={openAccountModal} variant="primary" className={styles.addressButton}>
                    <Box className={styles.starsHolder} title={loyaltyMap[loyaltyScore]}>
                      {loyaltyScore < 5 ? <FilledStar /> : <EmptyStar />}
                      {loyaltyScore < 4 ? <FilledStar /> : <EmptyStar />}
                      {loyaltyScore < 3 ? <FilledStar /> : <EmptyStar />}
                      {loyaltyScore < 2 ? <FilledStar /> : <EmptyStar />}
                    </Box>
                    {cutAddressName(account.address)}
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
