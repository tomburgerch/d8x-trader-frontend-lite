import { useAtom } from 'jotai';
import { memo, useEffect, useRef } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { Box } from '@mui/material';

import { Container } from 'components/container/Container';
import { Footer } from 'components/footer/Footer';
import { CollateralsSelect } from 'components/header/elements/collaterals-select/CollateralsSelect';
import { Header } from 'components/header/Header';
import { getOpenWithdrawals } from 'network/history';
import { GlobalStats } from 'pages/vault-page/components/global-stats/GlobalStats';
import { LiquidityBlock } from 'pages/vault-page/components/liquidity-block/LiquidityBlock';
import { selectedPoolAtom } from 'store/pools.store';
import { withdrawalsAtom } from 'store/vault-pools.store';

import styles from './VaultPage.module.scss';

export const VaultPage = memo(() => {
  const chainId = useChainId();
  const { address } = useAccount();

  const [selectedPool] = useAtom(selectedPoolAtom);
  const [, setWithdrawals] = useAtom(withdrawalsAtom);

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
      .finally(() => {
        withdrawalsRequestSentRef.current = false;
      });
  }, [chainId, address, selectedPool, setWithdrawals]);

  return (
    <Box className={styles.root}>
      <Header>
        <CollateralsSelect label="Liquidity pool" />
      </Header>
      <Container className={styles.container}>
        <GlobalStats />
        <LiquidityBlock />
      </Container>
      <Footer />
    </Box>
  );
});
