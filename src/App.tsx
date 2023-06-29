import { useAtom } from 'jotai';
import { memo, useEffect } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { Box } from '@mui/material';

import { StaticBackground } from 'components/static-background/StaticBackground';
import { TraderPage } from 'pages/trader-page/TraderPage';
import { appDimensionsAtom } from 'store/app.store';

import '@rainbow-me/rainbowkit/styles.css';

import styles from './App.module.scss';
import { LiquidityPage } from './pages/liquidity-page/LiquidityPage';

export const App = memo(() => {
  const { width, height, ref } = useResizeDetector();

  const [, setDimensions] = useAtom(appDimensionsAtom);

  useEffect(() => {
    setDimensions({ width, height });
  }, [width, height, setDimensions]);

  return (
    <Box className={styles.root} ref={ref}>
      <Box className={styles.content}>
        {/* <StaticBackground /> */}
        <Routes>
          <Route key="liquidity-page" path="/liquidity" element={<LiquidityPage />} />
          <Route key="trader-page" path="*" element={<TraderPage />} />
        </Routes>
        <ToastContainer position="top-left" autoClose={10_000} />
      </Box>
    </Box>
  );
});
