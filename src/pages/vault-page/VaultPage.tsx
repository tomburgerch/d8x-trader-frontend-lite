import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useChainId } from 'wagmi';

import { Box, useMediaQuery, useTheme } from '@mui/material';

import { Container } from 'components/container/Container';
import { HeaderPortal } from 'components/header/HeaderPortal';
import { CollateralsSelect } from 'components/header/elements/collaterals-select/CollateralsSelect';
import { Helmet } from 'components/helmet/Helmet';
import { getOpenWithdrawals } from 'network/history';
import { GlobalStats } from 'pages/vault-page/components/global-stats/GlobalStats';
import { LiquidityBlock } from 'pages/vault-page/components/liquidity-block/LiquidityBlock';
import { selectedPoolAtom } from 'store/pools.store';
import { triggerWithdrawalsUpdateAtom, withdrawalsAtom } from 'store/vault-pools.store';

import styles from './VaultPage.module.scss';

export const VaultPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const { t } = useTranslation();

  const chainId = useChainId();
  const { address } = useAccount();

  const [selectedPool] = useAtom(selectedPoolAtom);
  const [triggerWithdrawalsUpdate] = useAtom(triggerWithdrawalsUpdateAtom);
  const setWithdrawals = useSetAtom(withdrawalsAtom);

  const withdrawalsRequestSentRef = useRef(false);

  useEffect(() => {
    if (!chainId || !selectedPool || !address) {
      setWithdrawals([]);
      return;
    }

    if (withdrawalsRequestSentRef.current) {
      return;
    }

    withdrawalsRequestSentRef.current = true;

    getOpenWithdrawals(chainId, address, selectedPool.poolSymbol)
      .then(({ withdrawals }) => setWithdrawals(withdrawals))
      .catch(console.error)
      .finally(() => {
        withdrawalsRequestSentRef.current = false;
      });
  }, [chainId, address, selectedPool, setWithdrawals, triggerWithdrawalsUpdate]);

  return (
    <>
      <Helmet title={`${selectedPool?.poolSymbol} Vault | D8X App`} />
      <Box className={styles.root}>
        <HeaderPortal>
          <CollateralsSelect label={t('common.select.collateral.label2')} />
        </HeaderPortal>
        {isSmallScreen && (
          <Box className={styles.mobileSelectBoxes}>
            {<CollateralsSelect label={t('common.select.collateral.label2')} />}
          </Box>
        )}
        <Container className={styles.container}>
          <GlobalStats />
          <LiquidityBlock />
        </Container>
      </Box>
    </>
  );
};
