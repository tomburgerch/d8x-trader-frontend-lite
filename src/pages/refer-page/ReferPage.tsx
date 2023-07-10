import { memo } from 'react';

import { Box } from '@mui/material';

import { LiquidityPoolsSelect } from 'components/header/elements/liquidity-pools-select/LiquidityPoolsSelect';
import { Header } from 'components/header/Header';
import { Container } from 'components/container/Container';
import { Footer } from 'components/footer/Footer';

import styles from './ReferPage.module.scss';

export const ReferPage = memo(() => {
  return (
    <Box className={styles.root}>
      <Header>
        <LiquidityPoolsSelect />
      </Header>
      <Container className={styles.container}>Content</Container>
      <Footer />
    </Box>
  );
});
