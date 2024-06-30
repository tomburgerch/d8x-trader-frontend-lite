import { useAtomValue, useSetAtom } from 'jotai';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { type Address, erc20Abi, formatUnits } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

import { Menu } from '@mui/icons-material';
import { Button, Divider, Drawer, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';

import LogoWithText from 'assets/logoWithText.svg?react';
import { Container } from 'components/container/Container';
import { DepositModal } from 'components/deposit-modal/DepositModal';
import { LanguageSwitcher } from 'components/language-switcher/LanguageSwitcher';
import { Separator } from 'components/separator/Separator';
import { WalletConnectButtonHolder } from 'components/wallet-connect-button/WalletConnectButtonHolder';
import { WalletConnectedButtons } from 'components/wallet-connect-button/WalletConnectedButtons';
import { web3AuthConfig } from 'config';
import { useUserWallet } from 'context/user-wallet-context/UserWalletContext';
import { createSymbol } from 'helpers/createSymbol';
import { getExchangeInfo, getPositionRisk } from 'network/network';
import { authPages, pages } from 'routes/pages';
import { connectModalOpenAtom } from 'store/global-modals.store';
import {
  collateralToSettleConversionAtom,
  gasTokenSymbolAtom,
  oracleFactoryAddrAtom,
  perpetualsAtom,
  poolsAtom,
  poolTokenBalanceAtom,
  poolTokenDecimalsAtom,
  positionsAtom,
  proxyAddrAtom,
  selectedPoolAtom,
  traderAPIAtom,
  triggerBalancesUpdateAtom,
  triggerPositionsUpdateAtom,
} from 'store/pools.store';
import { triggerUserStatsUpdateAtom } from 'store/vault-pools.store';
import type { ExchangeInfoI, PerpetualDataI } from 'types/types';
import { getEnabledChainId } from 'utils/getEnabledChainId';
import { isEnabledChain } from 'utils/isEnabledChain';

import { collateralsAtom } from './elements/market-select/collaterals.store';
import { SettingsBlock } from './elements/settings-block/SettingsBlock';
import { SettingsButton } from './elements/settings-button/SettingsButton';

import styles from './Header.module.scss';
import { PageAppBar } from './Header.styles';

interface HeaderPropsI {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

const INTERVAL_FOR_DATA_REFETCH = 1000;
const POOL_BALANCE_MAX_RETRIES = 120;
const DRAWER_WIDTH_FOR_TABLETS = 340;
const MAX_RETRIES = 3;

export const Header = memo(({ window }: HeaderPropsI) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const isTabletScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { t } = useTranslation();

  const { chain, chainId, address, isConnected, isReconnecting, isConnecting } = useAccount();

  const { gasTokenBalance, isGasTokenFetchError } = useUserWallet();

  const setPools = useSetAtom(poolsAtom);
  const setCollaterals = useSetAtom(collateralsAtom);
  const setPerpetuals = useSetAtom(perpetualsAtom);
  const setPositions = useSetAtom(positionsAtom);
  const setOracleFactoryAddr = useSetAtom(oracleFactoryAddrAtom);
  const setProxyAddr = useSetAtom(proxyAddrAtom);
  const setPoolTokenBalance = useSetAtom(poolTokenBalanceAtom);
  const setGasTokenSymbol = useSetAtom(gasTokenSymbolAtom);
  const setPoolTokenDecimals = useSetAtom(poolTokenDecimalsAtom);
  const setConnectModalOpen = useSetAtom(connectModalOpenAtom);
  const setCollToSettleConversion = useSetAtom(collateralToSettleConversionAtom);
  const triggerBalancesUpdate = useAtomValue(triggerBalancesUpdateAtom);
  const triggerPositionsUpdate = useAtomValue(triggerPositionsUpdateAtom);
  const triggerUserStatsUpdate = useAtomValue(triggerUserStatsUpdateAtom);
  const selectedPool = useAtomValue(selectedPoolAtom);
  const traderAPI = useAtomValue(traderAPIAtom);

  const [mobileOpen, setMobileOpen] = useState(false);

  const exchangeRequestRef = useRef(false);
  const positionsRequestRef = useRef(false);
  const traderAPIRef = useRef(traderAPI);
  const poolTokenBalanceDefinedRef = useRef(false);
  const poolTokenBalanceRetriesCountRef = useRef(0);

  // fetch the settle ccy fx -> save to atom

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
    if (positionsRequestRef.current) {
      return;
    }

    if (address && isEnabledChain(chainId)) {
      positionsRequestRef.current = true;
      getPositionRisk(chainId, null, address, Date.now())
        .then(({ data }) => {
          if (data && data.length > 0) {
            data.map(setPositions);
          }
        })
        .catch(console.error)
        .finally(() => {
          positionsRequestRef.current = false;
        });
    }
  }, [triggerPositionsUpdate, setPositions, chainId, address]);

  useEffect(() => {
    if (traderAPI && traderAPI.chainId === getEnabledChainId(chainId)) {
      traderAPIRef.current = traderAPI;
    }
  }, [traderAPI, chainId]);

  useEffect(() => {
    if (exchangeRequestRef.current) {
      return;
    }

    exchangeRequestRef.current = true;

    setExchangeInfo(null);

    let retries = 0;
    const executeQuery = async () => {
      while (retries < MAX_RETRIES) {
        try {
          let currentTraderAPI = null;
          const enabledChainId = getEnabledChainId(chainId);
          if (retries > 0 && traderAPIRef.current && traderAPIRef.current?.chainId === enabledChainId) {
            currentTraderAPI = traderAPIRef.current;
          }
          const data = await getExchangeInfo(enabledChainId, currentTraderAPI);
          setExchangeInfo(data.data);
          retries = MAX_RETRIES;

          for (const pool of data.data.pools) {
            let coll2settle;
            try {
              coll2settle =
                pool.marginTokenAddr === pool.settleTokenAddr
                  ? 1
                  : await currentTraderAPI?.fetchCollateralToSettlementConversion(pool.poolSymbol);
            } catch (error) {
              console.error(error);
              console.log({ pool });
            }

            setCollToSettleConversion({
              poolSymbol: pool.poolSymbol,
              settleSymbol: pool.settleSymbol,
              value: coll2settle ?? 1,
            });
          }
        } catch (error) {
          console.error(error);
          console.log(`ExchangeInfo attempt ${retries + 1} failed: ${error}`);
          retries++;
          if (retries === MAX_RETRIES) {
            // Throw the error if max retries reached
            throw new Error('ExchangeInfo failed after maximum retries: ' + error);
          }
        }
      }
    };

    executeQuery()
      .catch(console.error)
      .finally(() => {
        exchangeRequestRef.current = false;
      });
  }, [chainId, setCollToSettleConversion, setExchangeInfo]);

  const {
    data: poolTokenBalance,
    isError,
    isRefetching,
    refetch,
  } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: selectedPool?.settleTokenAddr as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as Address],
      },
      {
        address: selectedPool?.settleTokenAddr as Address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ],
    query: {
      enabled:
        !exchangeRequestRef.current &&
        address &&
        traderAPI?.chainId === chainId &&
        isEnabledChain(chainId) &&
        !!selectedPool?.settleTokenAddr &&
        isConnected &&
        !isReconnecting &&
        !isConnecting,
    },
  });

  useEffect(() => {
    if (!address || !chain) {
      return;
    }

    poolTokenBalanceDefinedRef.current = false;
    refetch().then().catch(console.error);

    const intervalId = setInterval(() => {
      if (poolTokenBalanceDefinedRef.current) {
        poolTokenBalanceRetriesCountRef.current = 0;
        clearInterval(intervalId);
        return;
      }

      if (POOL_BALANCE_MAX_RETRIES <= poolTokenBalanceRetriesCountRef.current) {
        clearInterval(intervalId);
        console.warn(`Pool token balance fetch failed after ${POOL_BALANCE_MAX_RETRIES}.`);
        poolTokenBalanceRetriesCountRef.current = 0;
        return;
      }

      refetch().then().catch(console.error);
      poolTokenBalanceRetriesCountRef.current++;
    }, INTERVAL_FOR_DATA_REFETCH);

    return () => {
      clearInterval(intervalId);
      poolTokenBalanceRetriesCountRef.current = 0;
    };
  }, [address, chain, refetch, triggerUserStatsUpdate, triggerBalancesUpdate]);

  useEffect(() => {
    if (poolTokenBalance && selectedPool && chain && !isError) {
      poolTokenBalanceDefinedRef.current = true;
      setPoolTokenBalance(+formatUnits(poolTokenBalance[0], poolTokenBalance[1]));
      setPoolTokenDecimals(poolTokenBalance[1]);
    } else {
      poolTokenBalanceDefinedRef.current = false;
      setPoolTokenBalance(undefined);
      setPoolTokenDecimals(undefined);
    }
  }, [selectedPool, chain, poolTokenBalance, isError, setPoolTokenBalance, setPoolTokenDecimals, isRefetching]);

  useEffect(() => {
    if (gasTokenBalance && !isGasTokenFetchError) {
      setGasTokenSymbol(gasTokenBalance.symbol);
    }
  }, [isGasTokenFetchError, gasTokenBalance, setGasTokenSymbol]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const availablePages = [...pages.filter((page) => page.enabled)];
  if (address && isEnabledChain(chainId)) {
    availablePages.push(
      ...authPages.filter((page) => page.enabled && (!page.enabledByChains || page.enabledByChains.includes(chainId)))
    );
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
      </Typography>
      <Divider />
      <nav className={styles.navMobileWrapper} onClick={handleDrawerToggle}>
        {availablePages.map((page) => (
          <NavLink
            key={page.id}
            to={page.path}
            className={({ isActive }) => `${styles.navMobileItem} ${isActive ? styles.active : styles.inactive}`}
          >
            {page.IconComponent && <page.IconComponent className={styles.pageIcon} />}
            {t(page.translationKey)}
          </NavLink>
        ))}
      </nav>
      {isTabletScreen && (
        <>
          <Divider />
          <div className={styles.settings}>
            <SettingsBlock />
          </div>
          <div className={styles.languageSwitcher}>
            <LanguageSwitcher />
          </div>
        </>
      )}
      <div className={styles.closeAction}>
        <Button onClick={handleDrawerToggle} variant="secondary" size="small">
          {t('common.info-modal.close')}
        </Button>
      </div>
    </>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <Container className={styles.root}>
        <div className={styles.headerHolder}>
          <PageAppBar position="static">
            <Toolbar className={styles.toolbar}>
              <div className={styles.leftSide}>
                <Typography variant="h6" component="div" className={styles.mainLogoHolder}>
                  <a href="/" className={styles.logoLink}>
                    <LogoWithText width={40} height={20} />
                  </a>
                </Typography>
                {!isSmallScreen && (
                  <nav className={styles.navWrapper}>
                    {availablePages.map((page) => (
                      <NavLink
                        key={page.id}
                        to={page.path}
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : styles.inactive}`}
                      >
                        {page.IconComponent && <page.IconComponent className={styles.pageIcon} />}
                        {t(page.translationKey)}
                      </NavLink>
                    ))}
                  </nav>
                )}
              </div>
              <div className={styles.center}>
                {!isTabletScreen && (
                  <div className={styles.titlebox}>
                    <div className={styles.header}>{'decentralized-perps.com'}</div>
                    <div className={styles.subHeader}>{'hosted on ICP'}</div>
                  </div>
                )}
              </div>
              {!isSmallScreen && (
                <Typography id="header-side" variant="h6" component="div" className={styles.selectBoxes} />
              )}
              {(!isMobileScreen || !isConnected) && (
                <Typography variant="h6" component="div" className={styles.walletConnect}>
                  {web3AuthConfig.isEnabled && !isConnected && (
                    <Button onClick={() => setConnectModalOpen(true)} className={styles.modalButton} variant="primary">
                      <span className={styles.modalButtonText}>{t('common.wallet-connect')}</span>
                    </Button>
                  )}
                  {(!web3AuthConfig.isEnabled || isConnected) && (
                    <>
                      <WalletConnectButtonHolder />
                      <WalletConnectedButtons />
                    </>
                  )}
                </Typography>
              )}
              {!isTabletScreen && <SettingsButton />}
              {isSmallScreen && (
                <Button onClick={handleDrawerToggle} variant="primary" className={styles.menuButton}>
                  <Menu />
                </Button>
              )}
            </Toolbar>
            {isMobileScreen && isConnected && (
              <div className={styles.mobileButtonsBlock}>
                <Separator />
                <div className={styles.mobileWalletButtons}>
                  <WalletConnectButtonHolder />
                  <WalletConnectedButtons />
                </div>
              </div>
            )}
            {isConnected && <DepositModal />}
          </PageAppBar>
          <nav>
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
                display: { md: 'block', lg: 'none' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: isMobileScreen ? '100%' : DRAWER_WIDTH_FOR_TABLETS,
                  backgroundColor: 'var(--d8x-color-background)',
                },
              }}
            >
              {drawer}
            </Drawer>
          </nav>
        </div>
      </Container>
    </>
  );
});
