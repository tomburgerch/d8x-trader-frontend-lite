import { useSetAtom } from 'jotai';
import { memo, useEffect } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { ToastContainer } from 'react-toastify';

import { Box } from '@mui/material';

import { ReferralConfirmModal } from 'components/referral-confirm-modal/ReferralConfirmModal';
import { StaticBackground } from 'components/static-background/StaticBackground';
import { WelcomeModal } from 'components/welcome-modal/WelcomeModal';
import { AppRoutes } from 'routes/routes';
import { appDimensionsAtom } from 'store/app.store';

import 'core-js/es/array';
import 'core-js/es/map';
import 'core-js/es/math';
import 'core-js/es/number';
import 'core-js/es/object';
import 'core-js/es/promise';
import 'core-js/es/string';

import styles from './App.module.scss';

export const App = memo(() => {
  const { width, height, ref } = useResizeDetector();

  const setDimensions = useSetAtom(appDimensionsAtom);

  useEffect(() => {
    setDimensions({ width, height });
  }, [width, height, setDimensions]);

  return (
    <Box className={styles.root} ref={ref}>
      <Box className={styles.content}>
        <StaticBackground />
        <Suspense fallback={null}>
          <AppRoutes />
        </Suspense>
        <WelcomeModal />
        <ReferralConfirmModal />
        <ToastContainer position="top-left" autoClose={10_000} />
      </Box>
    </Box>
  );
});
