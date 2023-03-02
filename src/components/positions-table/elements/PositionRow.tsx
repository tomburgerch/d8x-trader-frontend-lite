import { Button, TableCell, TableRow, Typography } from '@mui/material';

import { formatToCurrency } from 'utils/formatToCurrency';
import { MarginAccountI } from '../../../types/types';
import { parseSymbol } from '../../../helpers/parseSymbol';

interface PositionRowPropsI {
  position: MarginAccountI;
}

export const PositionRow = ({ position }: PositionRowPropsI) => {
  const parsedSymbol = parseSymbol(position.symbol);

  return (
    <TableRow>
      <TableCell align="center">
        <Typography variant="cellSmall">
          {parsedSymbol?.baseCurrency}/{parsedSymbol?.quoteCurrency}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">
          {formatToCurrency(position.positionNotionalBaseCCY, parsedSymbol?.baseCurrency)}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{position.side}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">
          {formatToCurrency(position.entryPrice, parsedSymbol?.quoteCurrency)}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">
          {position.liquidationPrice[0] < 0
            ? `- ${parsedSymbol?.quoteCurrency}`
            : formatToCurrency(position.liquidationPrice[0], parsedSymbol?.quoteCurrency)}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{formatToCurrency(position.collateralCC, parsedSymbol?.poolSymbol)}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">
          {formatToCurrency(position.unrealizedPnlQuoteCCY, parsedSymbol?.quoteCurrency)}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Button variant="primary" size="small">
          Modify
        </Button>
      </TableCell>
    </TableRow>
  );
};
