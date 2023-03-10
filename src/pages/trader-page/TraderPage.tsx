import { memo, useMemo } from 'react';

import { Box } from '@mui/material';

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
      <Container className={styles.contentContainer}>
        <Box className={styles.leftBlock}>
          <PerpetualStats />
          <TableSelector selectorItems={selectorItems} />
        </Box>
        <Box className={styles.rightBlock}>
          <OrderBlock />
        </Box>
      </Container>
      <Footer />
    </Box>
  );
});
