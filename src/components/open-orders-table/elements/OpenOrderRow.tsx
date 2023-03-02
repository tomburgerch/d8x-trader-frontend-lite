import { format } from 'date-fns';

import { Button, TableCell, TableRow, Typography } from '@mui/material';

import { formatToCurrency } from 'utils/formatToCurrency';
import { OrderI } from '../../../types/types';
import { parseSymbol } from '../../../helpers/parseSymbol';

interface OpenOrderRowPropsI {
  order: OrderI;
}

export const OpenOrderRow = ({ order }: OpenOrderRowPropsI) => {
  const parsedSymbol = parseSymbol(order.symbol);
  const deadlineDate = order.deadline ? format(new Date(order.deadline * 1000), 'MMM dd yyyy') : '';

  return (
    <TableRow>
      <TableCell align="center">
        <Typography variant="cellSmall">
          {parsedSymbol?.baseCurrency}/{parsedSymbol?.quoteCurrency}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{order.side}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">
          {['STOP_LIMIT', 'STOP_MARKET'].includes(order.type) ? 'STOP' : order.type}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{formatToCurrency(order.quantity, parsedSymbol?.baseCurrency)}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">
          {order.limitPrice ? formatToCurrency(order.limitPrice, parsedSymbol?.quoteCurrency) : 'N/A'}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">
          {order.stopPrice ? formatToCurrency(order.stopPrice, parsedSymbol?.quoteCurrency) : 'N/A'}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{order.leverage}x</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{deadlineDate}</Typography>
      </TableCell>
      <TableCell align="left">
        <Button variant="primary" size="small">
          Cancel
        </Button>
      </TableCell>
    </TableRow>
  );
};
