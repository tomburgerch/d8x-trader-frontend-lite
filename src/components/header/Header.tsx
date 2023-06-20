import { useAtom } from 'jotai';
import { memo, useCallback, useEffect, useRef } from 'react';
import { useAccount, useBalance, useNetwork } from 'wagmi';

import { Box, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';

import { getExchangeInfo } from 'network/network';
import {
  oracleFactoryAddrAtom,
  poolTokenBalanceAtom,
  poolsAtom,
  proxyAddrAtom,
  selectedPoolAtom,
  perpetualsAtom,
  traderAPIAtom,
  chainIdAtom,
} from 'store/pools.store';

import { Container } from '../container/Container';
import { InteractiveLogo } from '../interactive-logo/InteractiveLogo';
import { WalletConnectButton } from '../wallet-connect-button/WalletConnectButton';

import { CollateralsSelect } from './elements/collaterals-select/CollateralsSelect';
import { PerpetualsSelect } from './elements/perpetuals-select/PerpetualsSelect';

import styles from './Header.module.scss';
import { PageAppBar } from './Header.styles';
import { ExchangeInfoI, PerpetualDataI } from '../../types/types';
import { createSymbol } from '../../helpers/createSymbol';

// Might be used later
// interface HeaderPropsI {
//   /**
//    * Injected by the documentation to work in an iframe.
//    * You won't need it on your project.
//    */
//   window?: () => Window;
// }

// Might be used later
// const drawerWidth = 240;

export const Header = memo(() => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const { chain } = useNetwork();
  const { address } = useAccount();

  const [, setPools] = useAtom(poolsAtom);
  const [, setPerpetuals] = useAtom(perpetualsAtom);
  const [, setOracleFactoryAddr] = useAtom(oracleFactoryAddrAtom);
  const [, setProxyAddr] = useAtom(proxyAddrAtom);
  const [, setPoolTokenBalance] = useAtom(poolTokenBalanceAtom);
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [chainId, setChainId] = useAtom(chainIdAtom);

  // Might be used later
  // const [mobileOpen, setMobileOpen] = useState(false);

  // const chainId = useMemo(() => {
  //   if (chain) {
  //     console.log(`switched chain id: ${chain.id}`);
  //     return chain.id;
  //   }
  // }, [chain]);
  const requestRef = useRef(false);
  const chainIdRef = useRef(chainId);

  const setExchangeInfo = useCallback(
    (data: ExchangeInfoI | null) => {
      if (!data) {
        setProxyAddr(undefined);
        return;
      }
      setPools(data.pools);
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
    [setPools, setPerpetuals, setOracleFactoryAddr, setProxyAddr]
  );

  useEffect(() => {
    if (!requestRef.current && chain && chain.id !== chainIdRef.current) {
      requestRef.current = true;
      setExchangeInfo(null);
      getExchangeInfo(chain.id, null)
        .then(({ data }) => {
          setExchangeInfo(data);
          setChainId(chain.id);
        })
        .catch((err) => {
          console.log(err);
          // API call failed - try with SDK
          if (traderAPI && chain.id) {
            getExchangeInfo(chain.id, traderAPI).then(({ data }) => {
              setExchangeInfo(data);
              setChainId(chain.id);
            });
          }
        })
        .finally(() => {
          requestRef.current = false;
        });
    }
  }, [chain, traderAPI, setExchangeInfo, setChainId]); //setPools, setPerpetuals, setOracleFactoryAddr, setProxyAddr]);

  const { data: poolTokenBalance, isError } = useBalance({
    address: address,
    token: selectedPool?.marginTokenAddr as `0x${string}` | undefined,
    chainId: chain?.id,
    enabled: !requestRef.current && address !== undefined,
    // onSuccess(data) {
    //   console.log(
    //     `my ${selectedPool?.poolSymbol} (addr ${selectedPool?.marginTokenAddr} on chain ${chainId}) balance is ${data.formatted} ${data.symbol}`
    //   );
    // },
    // onError() {
    //   console.log(
    //     `failed to fetch balance of ${selectedPool?.poolSymbol} margin token: ${selectedPool?.marginTokenAddr}, chain id ${chainId})`
    //   );
    // },
  });

  useEffect(() => {
    if (poolTokenBalance && selectedPool && chain && !isError) {
      setPoolTokenBalance(Number(poolTokenBalance.formatted));
    }
  }, [selectedPool, chain, poolTokenBalance, isError, setPoolTokenBalance]);

  /*
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <InteractiveLogo />
      </Typography>
      <Divider />
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;
  */

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
                <CollateralsSelect />
                <PerpetualsSelect />
              </Typography>
            )}
            <Typography variant="h6" component="div" className={styles.walletConnect}>
              <WalletConnectButton />
            </Typography>
            {/*}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { sm: 'none' } }} />
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            {*/}
          </Toolbar>
          {isSmallScreen && (
            <Box className={styles.mobileSelectBoxes}>
              <CollateralsSelect />
              <PerpetualsSelect />
            </Box>
          )}
        </PageAppBar>
        {/*}
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
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        {*/}
      </Box>
    </Container>
  );
});
