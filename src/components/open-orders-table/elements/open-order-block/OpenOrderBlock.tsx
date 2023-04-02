import { format } from 'date-fns';

import { Box, Button } from '@mui/material';

import { SidesRow } from 'components/sides-row/SidesRow';
import { parseSymbol } from 'helpers/parseSymbol';
import type { OrderWithIdI, TableHeaderI } from 'types/types';
import { formatToCurrency } from 'utils/formatToCurrency';

import { typeToLabelMap } from '../../typeToLabelMap';

import styles from './OpenOrderBlock.module.scss';

interface OpenOrderBlockPropsI {
  headers: TableHeaderI[];
  order: OrderWithIdI;
  handleOrderCancel: (order: OrderWithIdI) => void;
}

export const OpenOrderBlock = ({ headers, order, handleOrderCancel }: OpenOrderBlockPropsI) => {
  const parsedSymbol = parseSymbol(order.symbol);
  const deadlineDate = order.deadline ? format(new Date(order.deadline * 1000), 'MMM dd yyyy') : '';
  const leverage = order.leverage === undefined ? order.leverage : Math.round(100 * order.leverage) / 100;

  return (
    <Box className={styles.root}>
      <Box className={styles.dataBlock}>
        <SidesRow
          leftSide={headers[0].label}
          rightSide={`${parsedSymbol?.baseCurrency}/${parsedSymbol?.quoteCurrency}`}
          rightSideStyles={styles.value}
        />
        <SidesRow leftSide={headers[1].label} rightSide={order.side} rightSideStyles={styles.value} />
        <SidesRow leftSide={headers[2].label} rightSide={typeToLabelMap[order.type]} rightSideStyles={styles.value} />
        <SidesRow
          leftSide={headers[3].label}
          rightSide={formatToCurrency(order.quantity, parsedSymbol?.baseCurrency)}
          rightSideStyles={styles.value}
        />
        <SidesRow
          leftSide={headers[4].label}
          rightSide={order.limitPrice ? formatToCurrency(order.limitPrice, parsedSymbol?.quoteCurrency) : 'N/A'}
          rightSideStyles={styles.value}
        />
        <SidesRow
          leftSide={headers[5].label}
          rightSide={order.stopPrice ? formatToCurrency(order.stopPrice, parsedSymbol?.quoteCurrency) : 'N/A'}
          rightSideStyles={styles.value}
        />
        <SidesRow leftSide={headers[6].label} rightSide={`${leverage}x`} rightSideStyles={styles.value} />
        <SidesRow leftSide={headers[7].label} rightSide={deadlineDate} rightSideStyles={styles.value} />
      </Box>
      <Box className={styles.actionBlock}>
        <Button variant="primary" size="tableSmall" onClick={() => handleOrderCancel(order)}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};
