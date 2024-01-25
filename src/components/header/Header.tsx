import classNames from 'classnames';
import { useAtom, useSetAtom } from 'jotai';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { type Address, useAccount, useBalance, useChainId, useNetwork } from 'wagmi';

import { Close, Menu } from '@mui/icons-material';
import { Box, Button, Divider, Drawer, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';

import { ReactComponent as LogoWithText } from 'assets/logoWithText.svg';
import { Container } from 'components/container/Container';
import { LanguageSwitcher } from 'components/language-switcher/LanguageSwitcher';
import { WalletConnectButton } from 'components/wallet-connect-button/WalletConnectButton';
import { createSymbol } from 'helpers/createSymbol';
import { getExchangeInfo } from 'network/network';
import { authPages, pages } from 'routes/pages';
import { hideBetaTextAtom } from 'store/app.store';
import {
  gasTokenSymbolAtom,
  oracleFactoryAddrAtom,
  perpetualsAtom,
  poolsAtom,
  poolTokenBalanceAtom,
  poolTokenDecimalsAtom,
  proxyAddrAtom,
  selectedPoolAtom,
  traderAPIAtom,
} from 'store/pools.store';
import { triggerUserStatsUpdateAtom } from 'store/vault-pools.store';
import type { ExchangeInfoI, PerpetualDataI } from 'types/types';

import { collateralsAtom } from './elements/market-select/collaterals.store';
import { SettingsBlock } from './elements/settings-block/SettingsBlock';
import { SettingsButton } from './elements/settings-button/SettingsButton';

import styles from './Header.module.scss';
import { PageAppBar } from './Header.styles';
import { Separator } from '../separator/Separator';

interface HeaderPropsI {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

const DRAWER_WIDTH_FOR_TABLETS = 340;

export const Header = memo(({ window }: HeaderPropsI) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const isTabletScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { t } = useTranslation();

  const chainId = useChainId();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();

  const setPools = useSetAtom(poolsAtom);
  const setCollaterals = useSetAtom(collateralsAtom);
  const setPerpetuals = useSetAtom(perpetualsAtom);
  const setOracleFactoryAddr = useSetAtom(oracleFactoryAddrAtom);
  const setProxyAddr = useSetAtom(proxyAddrAtom);
  const setPoolTokenBalance = useSetAtom(poolTokenBalanceAtom);
  const setGasTokenSymbol = useSetAtom(gasTokenSymbolAtom);
  const setPoolTokenDecimals = useSetAtom(poolTokenDecimalsAtom);
  const [triggerUserStatsUpdate] = useAtom(triggerUserStatsUpdateAtom);
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [hideBetaText, setHideBetaText] = useAtom(hideBetaTextAtom);

  const [mobileOpen, setMobileOpen] = useState(false);
  const requestRef = useRef(false);

  const setExchangeInfo = useCallback(
    (data: ExchangeInfoI | null) => {
      if (!data) {
        setProxyAddr(undefined);
        return;
      }
      const pools = data.pools
        .filter((pool) => pool.isRunning)
        .map((pool) => {
          let poolId = 0;
          if (traderAPI) {
            try {
              poolId = traderAPI.getPoolIdFromSymbol(pool.poolSymbol);
            } catch (error) {
              console.log(error);
            }
          }

          return {
            ...pool,
            poolId,
          };
        });
      setPools(pools);
      setCollaterals(pools.map((pool) => pool.poolSymbol));
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
    },
    [setPools, setCollaterals, setPerpetuals, setOracleFactoryAddr, setProxyAddr, traderAPI]
  );

  useEffect(() => {
    if (!requestRef.current && chainId && (!traderAPI || traderAPI.chainId === chainId)) {
      requestRef.current = true;
      setExchangeInfo(null);
      getExchangeInfo(chainId, traderAPI)
        .then(({ data }) => {
          setExchangeInfo(data);
          requestRef.current = false;
        })
        .catch((err) => {
          console.error(err);
          requestRef.current = false;
        });
    }
  }, [chainId, setExchangeInfo, traderAPI]);

  const {
    data: poolTokenBalance,
    isError,
    refetch,
  } = useBalance({
    address,
    token: selectedPool?.marginTokenAddr as Address,
    chainId: chain?.id,
    enabled: !requestRef.current && address && chainId === chain?.id && !!selectedPool?.marginTokenAddr,
  });

  const { data: gasTokenBalance, isError: isGasTokenFetchError } = useBalance({
    address,
  });

  useEffect(() => {
    if (address) {
      refetch().then().catch(console.error);
    }
  }, [address, refetch, triggerUserStatsUpdate]);

  useEffect(() => {
    if (poolTokenBalance && selectedPool && chain && !isError) {
      setPoolTokenBalance(Number(poolTokenBalance.formatted));
      setPoolTokenDecimals(poolTokenBalance.decimals);
    }
  }, [selectedPool, chain, poolTokenBalance, isError, setPoolTokenBalance, setPoolTokenDecimals]);

  useEffect(() => {
    if (gasTokenBalance && !isGasTokenFetchError) {
      setGasTokenSymbol(gasTokenBalance.symbol);
    }
  }, [isGasTokenFetchError, gasTokenBalance, setGasTokenSymbol]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const availablePages = [...pages];
  if (address) {
    availablePages.push(...authPages);
  }
  const drawer = (
    <>
      <Typography
        variant="h6"
        sx={{ my: 2, textAlign: 'center' }}
        onClick={handleDrawerToggle}
        className={styles.drawerLogoHolder}
      >
        <LogoWithText width={40} height={20} />
        <span className={styles.betaTag}>{t('common.public-beta.beta-tag')}</span>
      </Typography>
      <Divider />
      <nav className={styles.navMobileWrapper} onClick={handleDrawerToggle}>
        {availablePages.map((page) => (
          <NavLink
            key={page.id}
            to={page.path}
            className={({ isActive }) => `${styles.navMobileItem} ${isActive ? styles.active : styles.inactive}`}
          >
            {t(page.translationKey)}
          </NavLink>
        ))}
      </nav>
      <Divider />
      <Box className={styles.settings}>
        <SettingsBlock />
      </Box>
      <Box className={styles.languageSwitcher}>
        <LanguageSwitcher />
      </Box>
      <Box className={styles.closeAction}>
        <Button onClick={handleDrawerToggle} variant="secondary" size="small">
          {t('common.info-modal.close')}
        </Button>
      </Box>
    </>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <div className={classNames(styles.betaInfoLine, { [styles.hideBetaText]: hideBetaText })}>
        <div className={styles.textBlock}>{t('common.public-beta.info-text')}</div>
        <div title={t('common.info-modal.close')} className={styles.closeButton} onClick={() => setHideBetaText(true)}>
          <Close className={styles.closeIcon} />
        </div>
      </div>
      <Container className={styles.root}>
        <div className={styles.headerHolder}>
          <PageAppBar position="static">
            <Toolbar className={styles.toolbar}>
              <Box className={styles.leftSide}>
                <Typography variant="h6" component="div" className={styles.mainLogoHolder}>
                  <a href="/" className={styles.logoLink}>
                    <LogoWithText width={40} height={20} />
                  </a>
                  <span className={styles.betaTag}>{t('common.public-beta.beta-tag')}</span>
                </Typography>
                {!isTabletScreen && (
                  <nav className={styles.navWrapper}>
                    {availablePages.map((page) => (
                      <NavLink
                        key={page.id}
                        to={page.path}
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : styles.inactive}`}
                      >
                        {t(page.translationKey)}
                      </NavLink>
                    ))}
                  </nav>
                )}
              </Box>
              <Box className={styles.center}>
                {!isTabletScreen && (
                  <div className={styles.titlebox}>
                    <div className={styles.header}>{'decentralized-perps.com'}</div>
                    <div className={styles.subHeader}>{'hosted on ICP'}</div>
                  </div>
                )}
              </Box>
              {!isSmallScreen && (
                <Typography id="header-side" variant="h6" component="div" className={styles.selectBoxes} />
              )}
              {(!isMobileScreen || !isConnected) && (
                <Typography variant="h6" component="div" className={styles.walletConnect}>
                  <WalletConnectButton />
                </Typography>
              )}
              {!isTabletScreen && <SettingsButton />}
              {isTabletScreen && (
                <Button onClick={handleDrawerToggle} variant="primary" className={styles.menuButton}>
                  <Menu />
                </Button>
              )}
            </Toolbar>
            {isMobileScreen && isConnected && (
              <div className={styles.mobileButtonsBlock}>
                <Separator />
                <div className={styles.mobileWalletButtons}>
                  <WalletConnectButton />
                </div>
              </div>
            )}
          </PageAppBar>
          <Box component="nav">
            <Drawer
              anchor="right"
              container={container}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                display: { sm: 'block', md: 'none' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: isMobileScreen ? '100%' : DRAWER_WIDTH_FOR_TABLETS,
                  backgroundColor: 'var(--d8x-color-background)',
                },
              }}
            >
              {drawer}
            </Drawer>
          </Box>
        </div>
      </Container>
    </>
  );
});
