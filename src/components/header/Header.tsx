import { useAtom } from 'jotai';
import type { PropsWithChildren } from 'react';
import { memo, useEffect, useMemo, useRef } from 'react';
import { useAccount, useBalance, useNetwork } from 'wagmi';

import { Box, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';

import { createSymbol } from 'helpers/createSymbol';
import { getExchangeInfo } from 'network/network';
import { liquidityPoolsAtom } from 'store/liquidity-pools.store';
import {
  oracleFactoryAddrAtom,
  poolTokenBalanceAtom,
  poolsAtom,
  proxyAddrAtom,
  selectedPoolAtom,
  perpetualsAtom,
} from 'store/pools.store';
import { PerpetualDataI } from 'types/types';

import { Container } from '../container/Container';
import { InteractiveLogo } from '../interactive-logo/InteractiveLogo';
import { WalletConnectButton } from '../wallet-connect-button/WalletConnectButton';

import { PageAppBar } from './Header.styles';
import styles from './Header.module.scss';

export const Header = memo(({ children }: PropsWithChildren) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

  // const chainId = useChainId();
  const { chain } = useNetwork();
  const { address } = useAccount();

  const [, setPools] = useAtom(poolsAtom);
  const [, setLiquidityPools] = useAtom(liquidityPoolsAtom);

  const [, setPerpetuals] = useAtom(perpetualsAtom);
  const [, setOracleFactoryAddr] = useAtom(oracleFactoryAddrAtom);
  const [, setProxyAddr] = useAtom(proxyAddrAtom);
  const [, setPoolTokenBalance] = useAtom(poolTokenBalanceAtom);
  const [selectedPool] = useAtom(selectedPoolAtom);

  const requestRef = useRef(false);

  useEffect(() => {
    if (!requestRef.current && chain) {
      requestRef.current = true;

      setProxyAddr(undefined);
      getExchangeInfo(chain.id, null).then(({ data }) => {
        setPools(data.pools);
        setLiquidityPools(data.pools);

        const perpetuals: PerpetualDataI[] = [];
        data.pools.forEach((pool) => {
          perpetuals.push(
            ...pool.perpetuals.map((perpetual) => ({
              id: perpetual.id,
              poolName: pool.poolSymbol,
              baseCurrency: perpetual.baseCurrency,
              quoteCurrency: perpetual.quoteCurrency,
              symbol: createSymbol({
                poolSymbol: pool.poolSymbol,
                baseCurrency: perpetual.baseCurrency,
                quoteCurrency: perpetual.quoteCurrency,
              }),
            }))
          );
        });
        setPerpetuals(perpetuals);

        setOracleFactoryAddr(data.oracleFactoryAddr);
        setProxyAddr(data.proxyAddr);

        requestRef.current = false;
      });
    }
  }, [chain, setPools, setLiquidityPools, setPerpetuals, setOracleFactoryAddr, setProxyAddr]);

  const { data: poolTokenBalance, isError } = useBalance({
    address: address,
    token: selectedPool?.marginTokenAddr as `0x${string}` | undefined,
    chainId: chain?.id,
    enabled: !requestRef.current && address !== undefined,
  });

  useEffect(() => {
    if (poolTokenBalance && selectedPool && chain && !isError) {
      setPoolTokenBalance(Number(poolTokenBalance.formatted));
    }
  }, [selectedPool, chain, poolTokenBalance, isError, setPoolTokenBalance]);

  return (
    <Container className={styles.root}>
      <Box sx={{ display: 'flex' }}>
        <PageAppBar position="static">
          <Toolbar className={styles.toolbar}>
            <Box className={styles.leftSide}>
              <Typography variant="h6" component="div">
                <a href="/" className={styles.logoLink}>
                  <InteractiveLogo />
                </a>
              </Typography>
            </Box>
            {!isSmallScreen && (
              <Typography variant="h6" component="div" className={styles.selectBoxes}>
                {children}
              </Typography>
            )}
            <Typography variant="h6" component="div" className={styles.walletConnect}>
              <WalletConnectButton />
            </Typography>
          </Toolbar>
          {isSmallScreen && <Box className={styles.mobileSelectBoxes}>{children}</Box>}
        </PageAppBar>
      </Box>
    </Container>
  );
});
