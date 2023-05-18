import { format } from 'date-fns';

import { TableCell, TableRow, Typography } from '@mui/material';

import type { PerpetualDataI, TableHeaderI, TradeHistoryI } from 'types/types';
import { formatToCurrency } from 'utils/formatToCurrency';

interface TradeHistoryRowPropsI {
  headers: TableHeaderI[];
  perpetuals: PerpetualDataI[];
  tradeHistory: TradeHistoryI;
}

export const TradeHistoryRow = ({ headers, perpetuals, tradeHistory }: TradeHistoryRowPropsI) => {
  const perpetual = perpetuals.find(({ id }) => id === tradeHistory.perpetualId);
  const time = format(new Date(tradeHistory.timestamp), 'yyyy-MM-dd HH:mm:ss');

  return (
    <TableRow>
      <TableCell align={headers[0].align}>
        <Typography variant="cellSmall">{time}</Typography>
      </TableCell>
      <TableCell align={headers[1].align}>
        <Typography variant="cellSmall">{perpetual?.symbol}</Typography>
      </TableCell>
      <TableCell align={headers[2].align}>
        <Typography variant="cellSmall">{tradeHistory.side}</Typography>
      </TableCell>
      {/*<TableCell align={headers[3].align} style={{ display: 'none' }}>
        <Typography variant="cellSmall">TYPE</Typography>
      </TableCell>*/}
      <TableCell align={headers[3].align}>
        <Typography variant="cellSmall">
          {perpetual ? formatToCurrency(tradeHistory.price, perpetual.quoteCurrency) : ''}
        </Typography>
      </TableCell>
      <TableCell align={headers[4].align}>
        <Typography variant="cellSmall">
          {perpetual ? formatToCurrency(tradeHistory.quantity, perpetual.baseCurrency) : ''}
        </Typography>
      </TableCell>
      <TableCell align={headers[5].align}>
        <Typography variant="cellSmall">
          {perpetual ? formatToCurrency(tradeHistory.fee, perpetual.poolName) : ''}
        </Typography>
      </TableCell>
      <TableCell align={headers[6].align}>
        <Typography variant="cellSmall">
          {perpetual ? formatToCurrency(tradeHistory.realizedPnl, perpetual.poolName) : ''}
        </Typography>
      </TableCell>
      <TableCell align={headers[7].align} />
    </TableRow>
  );
};
