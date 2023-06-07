import { memo } from 'react';

import { Box } from '@mui/material';

import { Container } from 'components/container/Container';
import { Footer } from 'components/footer/Footer';
import { LiquidityPoolsSelect } from 'components/header/elements/luquidity-pools-select/LiquidityPoolsSelect';
import { Header } from 'components/header/Header';
import { GlobalStats } from 'components/global-stats/GlobalStats';
import { LiquidityBlock } from 'components/liquidity-block/LiquidityBlock';
import { PersonalStats } from 'components/personal-stats/PersonalStats';

import styles from './LiquidityPage.module.scss';

export const LiquidityPage = memo(() => {
  return (
    <Box className={styles.root}>
      <Header>
        <LiquidityPoolsSelect />
      </Header>
      <Container className={styles.container}>
        <GlobalStats />
        <PersonalStats />
        <LiquidityBlock />
      </Container>
      <Footer />
    </Box>
  );
});
