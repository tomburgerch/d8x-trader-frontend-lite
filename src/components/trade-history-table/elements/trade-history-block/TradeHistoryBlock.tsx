import { format } from 'date-fns';
import { Box } from '@mui/material';

import { SidesRow } from 'components/sides-row/SidesRow';
import type { PerpetualDataI, TradeHistoryI, TableHeaderI } from 'types/types';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './TradeHistoryBlock.module.scss';

interface TradeHistoryRowPropsI {
  headers: TableHeaderI[];
  perpetuals: PerpetualDataI[];
  tradeHistory: TradeHistoryI;
}

export const TradeHistoryBlock = ({ headers, perpetuals, tradeHistory }: TradeHistoryRowPropsI) => {
  const perpetual = perpetuals.find(({ id }) => id === tradeHistory.perpetualId);
  const time = format(new Date(tradeHistory.timestamp), 'yyyy-MM-dd HH:mm:ss');

  return (
    <Box className={styles.root}>
      <Box className={styles.dataBlock}>
        <SidesRow leftSide={headers[0].label} rightSide={time} rightSideStyles={styles.value} />
        <SidesRow leftSide={headers[1].label} rightSide={perpetual?.symbol} rightSideStyles={styles.value} />
        <SidesRow leftSide={headers[2].label} rightSide={tradeHistory.side} rightSideStyles={styles.value} />
        {/*<SidesRow
          leftSide={headers[3].label}
          rightSide="Type"
          rightSideStyles={styles.value}
        />*/}
        <SidesRow
          leftSide={headers[3].label}
          rightSide={perpetual ? formatToCurrency(tradeHistory.price, perpetual.quoteCurrency) : ''}
          rightSideStyles={styles.value}
        />
        <SidesRow
          leftSide={headers[4].label}
          rightSide={perpetual ? formatToCurrency(tradeHistory.quantity, perpetual.baseCurrency) : ''}
          rightSideStyles={styles.value}
        />
        <SidesRow
          leftSide={headers[5].label}
          rightSide={perpetual ? formatToCurrency(tradeHistory.fee, perpetual.poolName) : ''}
          rightSideStyles={styles.value}
        />
        <SidesRow
          leftSide={headers[6].label}
          rightSide={perpetual ? formatToCurrency(tradeHistory.realizedPnl, perpetual.poolName) : ''}
          rightSideStyles={styles.value}
        />
      </Box>
    </Box>
  );
};
