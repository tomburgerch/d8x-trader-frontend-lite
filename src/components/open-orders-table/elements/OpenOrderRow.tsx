import { format } from 'date-fns';

import { Button, TableCell, TableRow, Typography } from '@mui/material';

import { parseSymbol } from 'helpers/parseSymbol';
import type { OrderI } from 'types/types';
import { formatToCurrency } from 'utils/formatToCurrency';

interface OpenOrderRowPropsI {
  order: OrderI & { id: string };
  handleOrderCancel: (orderId: string) => void;
}

const typeToLabelMap: Record<string, string> = {
  MARKET: 'Market',
  LIMIT: 'Limit',
  STOP_LIMIT: 'Stop',
  STOP_MARKET: 'Stop',
};

export const OpenOrderRow = ({ order, handleOrderCancel }: OpenOrderRowPropsI) => {
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
        <Typography variant="cellSmall">{typeToLabelMap[order.type]}</Typography>
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
        <Button variant="primary" size="small" onClick={() => handleOrderCancel(order.id)}>
          Cancel
        </Button>
      </TableCell>
    </TableRow>
  );
};
