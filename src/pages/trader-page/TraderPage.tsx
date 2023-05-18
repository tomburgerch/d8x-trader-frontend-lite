import { memo, useCallback, useMemo, useState } from 'react';

import { Box, useMediaQuery, useTheme } from '@mui/material';

import { Container } from 'components/container/Container';
import { Header } from 'components/header/Header';
import { Footer } from 'components/footer/Footer';
import { OpenOrdersTable } from 'components/open-orders-table/OpenOrdersTable';
import { OrderBlock } from 'components/order-block/OrderBlock';
import { PerpetualStats } from 'components/perpetual-stats/PerpetualStats';
import { PositionsTable } from 'components/positions-table/PositionsTable';
import { FundingTable } from 'components/funding-table/FundingTable';
import { TradeHistoryTable } from 'components/trade-history-table/TradeHistoryTable';
import { SelectorItemI, TableSelector } from 'components/table-selector/TableSelector';
import { TradingViewChart } from 'components/trading-view-chart/TradingViewChart';

import styles from './TraderPage.module.scss';

export const TraderPage = memo(() => {
  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const [activeAllIndex, setActiveAllIndex] = useState(0);
  const [activePositionIndex, setActivePositionIndex] = useState(0);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);

  const positionItems: SelectorItemI[] = useMemo(
    () => [
      {
        label: 'Positions',
        item: <PositionsTable />,
      },
      {
        label: 'Open Orders',
        item: <OpenOrdersTable />,
      },
    ],
    []
  );

  const historyItems: SelectorItemI[] = useMemo(
    () => [
      {
        label: 'Trade History',
        item: <TradeHistoryTable />,
      },
      {
        label: 'Funding',
        item: <FundingTable />,
      },
    ],
    []
  );

  const selectorForAllItems: SelectorItemI[] = useMemo(
    () => [...positionItems, ...historyItems],
    [positionItems, historyItems]
  );

  const handleActiveAllIndex = useCallback(
    (index: number) => {
      setActiveAllIndex(index);

      const firstTableItems = positionItems.length;
      if (index < firstTableItems) {
        setActivePositionIndex(index);
      } else {
        setActiveHistoryIndex(index - firstTableItems);
      }
    },
    [positionItems]
  );

  const handlePositionsIndex = useCallback((index: number) => {
    setActiveAllIndex(index);
    setActivePositionIndex(index);
  }, []);

  const handleHistoryIndex = useCallback(
    (index: number) => {
      setActiveAllIndex(index + positionItems.length);
      setActiveHistoryIndex(index);
    },
    [positionItems]
  );

  return (
    <Box className={styles.root}>
      <Header />
      {isBigScreen && (
        <Container className={styles.sidesContainer}>
          <Box className={styles.leftBlock}>
            <PerpetualStats />
            <TradingViewChart />
            <TableSelector
              selectorItems={selectorForAllItems}
              activeIndex={activeAllIndex}
              setActiveIndex={handleActiveAllIndex}
            />
          </Box>
          <Box className={styles.rightBlock}>
            <OrderBlock />
          </Box>
        </Container>
      )}
      {!isBigScreen && (
        <Container className={styles.columnContainer}>
          <PerpetualStats />
          <TradingViewChart />
          <OrderBlock />
          <TableSelector
            selectorItems={positionItems}
            activeIndex={activePositionIndex}
            setActiveIndex={handlePositionsIndex}
          />
          <TableSelector
            selectorItems={historyItems}
            activeIndex={activeHistoryIndex}
            setActiveIndex={handleHistoryIndex}
          />
        </Container>
      )}
      <Footer />
    </Box>
  );
});
