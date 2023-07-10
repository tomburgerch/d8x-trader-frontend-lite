import { memo, useState } from 'react';

import { Box } from '@mui/material';

import { LiquidityPoolsSelect } from 'components/header/elements/liquidity-pools-select/LiquidityPoolsSelect';
import { Header } from 'components/header/Header';
import { Container } from 'components/container/Container';
import { Footer } from 'components/footer/Footer';

import { TabSelector } from 'pages/refer-page/components/tab-selector/TabSelector';

import styles from './ReferPage.module.scss';

export const ReferPage = memo(() => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (newIndex: number) => setActiveTab(newIndex);

  return (
    <Box className={styles.root}>
      <Header>
        <LiquidityPoolsSelect />
      </Header>
      <Container className={styles.container}>
        <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
      </Container>
      <Footer />
    </Box>
  );
});
