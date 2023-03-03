import { Button, TableCell, TableRow, Typography } from '@mui/material';

import { parseSymbol } from 'helpers/parseSymbol';
import type { MarginAccountI } from 'types/types';
import { formatToCurrency } from 'utils/formatToCurrency';

interface PositionRowPropsI {
  position: MarginAccountI;
  handlePositionModify: (symbol: string) => void;
}

export const PositionRow = ({ position, handlePositionModify }: PositionRowPropsI) => {
  const parsedSymbol = parseSymbol(position.symbol);

  return (
    <TableRow>
      <TableCell align="left">
        <Typography variant="cellSmall">
          {parsedSymbol?.baseCurrency}/{parsedSymbol?.quoteCurrency}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">
          {formatToCurrency(position.positionNotionalBaseCCY, parsedSymbol?.baseCurrency)}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{position.side}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">
          {formatToCurrency(position.entryPrice, parsedSymbol?.quoteCurrency)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">
          {position.liquidationPrice[0] < 0
            ? `- ${parsedSymbol?.quoteCurrency}`
            : formatToCurrency(position.liquidationPrice[0], parsedSymbol?.quoteCurrency)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">
          {formatToCurrency(position.collateralCC, '')}({Math.round(position.leverage * 100) / 100}x)
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">
          {formatToCurrency(position.unrealizedPnlQuoteCCY, parsedSymbol?.quoteCurrency)}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Button variant="primary" size="small" onClick={() => handlePositionModify(position.symbol)}>
          Modify
        </Button>
      </TableCell>
    </TableRow>
  );
};
