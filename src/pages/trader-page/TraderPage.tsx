import { memo, useMemo } from 'react';

import { Box, useMediaQuery, useTheme } from '@mui/material';

import { Container } from 'components/container/Container';
import { Header } from 'components/header/Header';
import { Footer } from 'components/footer/Footer';
import { OpenOrdersTable } from 'components/open-orders-table/OpenOrdersTable';
import { OrderBlock } from 'components/order-block/OrderBlock';
import { PerpetualStats } from 'components/perpetual-stats/PerpetualStats';
import { PositionsTable } from 'components/positions-table/PositionsTable';
import { SelectorItemI, TableSelector } from 'components/table-selector/TableSelector';

import styles from './TraderPage.module.scss';

export const TraderPage = memo(() => {
  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const selectorItems: SelectorItemI[] = useMemo(
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

  return (
    <Box className={styles.root}>
      <Header />
      {isBigScreen && (
        <Container className={styles.sidesContainer}>
          <Box className={styles.leftBlock}>
            <PerpetualStats />
            <TableSelector selectorItems={selectorItems} />
          </Box>
          <Box className={styles.rightBlock}>
            <OrderBlock />
          </Box>
        </Container>
      )}
      {!isBigScreen && (
        <Container className={styles.columnContainer}>
          <PerpetualStats />
          <OrderBlock />
          <TableSelector selectorItems={selectorItems} />
        </Container>
      )}
      <Footer />
    </Box>
  );
});
