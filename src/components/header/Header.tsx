import { useAtom } from 'jotai';
import type { FC } from 'react';
import { memo, useEffect, useRef, useState } from 'react';

import { Box, Divider, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { getExchangeInfo } from 'network/network';
import { oracleFactoryAddrAtom, poolsAtom } from 'store/pools.store';

import { Container } from '../container/Container';
import { InteractiveLogo } from '../interactive-logo/InteractiveLogo';

import { CollateralsSelect } from './elements/collaterals-select/CollateralsSelect';
import { PerpetualsSelect } from './elements/perpetuals-select/PerpetualsSelect';

import { PageAppBar } from './Header.styles';
import styles from './Header.module.scss';

interface PropsI {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

const drawerWidth = 240;

export const Header: FC<PropsI> = memo(({ window }) => {
  const [, setPools] = useAtom(poolsAtom);
  const [, setOracleFactoryAddr] = useAtom(oracleFactoryAddrAtom);

  const [mobileOpen, setMobileOpen] = useState(false);

  const requestRef = useRef(false);

  useEffect(() => {
    if (!requestRef.current) {
      requestRef.current = true;
      getExchangeInfo().then(({ data }) => {
        setPools(data.pools);
        setOracleFactoryAddr(data.oracleFactoryAddr);
      });
    }
  }, [setPools, setOracleFactoryAddr]);

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

  return (
    <Container>
      <Box sx={{ display: 'flex' }}>
        <PageAppBar position="static">
          <Toolbar className={styles.toolbar}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <a href="/" className={styles.logoLink}>
                <InteractiveLogo />
              </a>
            </Typography>
            <Typography variant="h6" component="div" sx={{ flexGrow: 2 }} className={styles.selectBoxes}>
              <CollateralsSelect />
              <PerpetualsSelect />
            </Typography>
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
          </Toolbar>
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
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
      </Box>
    </Container>
  );
});
