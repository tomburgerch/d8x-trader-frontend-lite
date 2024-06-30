import { useAtomValue, useSetAtom } from 'jotai';
import { memo, Suspense, useEffect } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useAccount } from 'wagmi';

import { CircularProgress } from '@mui/material';

import { AtomsGlobalUpdates } from 'components/atoms-global-updates/AtomsGlobalUpdates';
import { CedeWidgetModal } from 'components/cede-widget-modal/CedeWidgetModal';
import { ConnectModal } from 'components/connect-modal/ConnectModal';
import { Footer } from 'components/footer/Footer';
import { Header } from 'components/header/Header';
import { ReferralConfirmModal } from 'components/referral-confirm-modal/ReferralConfirmModal';
import { SDKLoader } from 'components/sdk-loader/SDKLoader';
import { OneClickTradingModal } from 'components/wallet-connect-button/components/one-click-trading-modal/OneClickTradingModal';
import { WelcomeModal } from 'components/welcome-modal/WelcomeModal';
import { web3AuthConfig } from 'config';
import { AppRoutes } from 'routes/routes';
import { appDimensionsAtom } from 'store/app.store';
import { web3AuthIdTokenAtom } from 'store/web3-auth.store';
import { ToastContainerWrapper } from 'ToastContainerWrapper';

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

  const { isConnected } = useAccount();

  const web3authIdToken = useAtomValue(web3AuthIdTokenAtom);
  const setDimensions = useSetAtom(appDimensionsAtom);

  const isSignedInSocially = web3AuthConfig.isEnabled && web3authIdToken != '';

  useEffect(() => {
    setDimensions({ width, height });
  }, [width, height, setDimensions]);

  return (
    <div className={styles.root} ref={ref}>
      <div className={styles.content}>
        <Header />
        <Suspense
          fallback={
            <div className={styles.spinnerContainer}>
              <CircularProgress />
            </div>
          }
        >
          <AppRoutes />
        </Suspense>
        <Footer />

        <SDKLoader />
        <AtomsGlobalUpdates />
        <WelcomeModal />
        <ReferralConfirmModal />
        <CedeWidgetModal />
        {!isSignedInSocially && isConnected && <OneClickTradingModal />}
        {web3AuthConfig.isEnabled && !isConnected && <ConnectModal />}
        <ToastContainerWrapper />
      </div>
    </div>
  );
});
