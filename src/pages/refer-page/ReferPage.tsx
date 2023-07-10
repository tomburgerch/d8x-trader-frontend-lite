import { memo, useState } from 'react';

import { Box } from '@mui/material';

import { LiquidityPoolsSelect } from 'components/header/elements/liquidity-pools-select/LiquidityPoolsSelect';
import { Header } from 'components/header/Header';
import { Container } from 'components/container/Container';
import { Footer } from 'components/footer/Footer';

import { TabSelector } from './components/tab-selector/TabSelector';
import { ReferrerTab } from './components/referrer-tab/ReferrerTab';
import { TraderTab } from './components/trader-tab/TraderTab';

import styles from './ReferPage.module.scss';

const tabComponents = [<ReferrerTab key="referrerTab" />, <TraderTab key="traderTab" />];

export const ReferPage = memo(() => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabChange = (newIndex: number) => setActiveTabIndex(newIndex);

  return (
    <Box className={styles.root}>
      <Header>
        <LiquidityPoolsSelect />
      </Header>
      <Container className={styles.container}>
        <TabSelector activeTab={activeTabIndex} onTabChange={handleTabChange} />
        {tabComponents[activeTabIndex]}
      </Container>
      <Footer />
    </Box>
  );
});
