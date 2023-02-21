import { useMemo } from 'react';

import {
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';

import { formatToCurrency } from 'utils/formatToCurrency';

import { MOCK_POSITIONS } from './mock';

import styles from './PositionsTable.module.scss';

const positionsHeaders = ['Symbol', 'Position Size', 'Entry Price', 'Liq Price', 'Margin', 'Unrealized PNL'];

export const PositionsTable = () => {
  const positions = useMemo(
    () =>
      MOCK_POSITIONS.map((position) => ({
        ...position,
        entryPrice: formatToCurrency(position.entryPrice),
        liqPrice: formatToCurrency(position.liqPrice),
        margin: formatToCurrency(position.margin),
        unrealizedPnl: formatToCurrency(position.unrealizedPnl),
      })),
    []
  );

  return (
    <TableContainer className={styles.root}>
      <MuiTable>
        <TableHead className={styles.tableHead}>
          <TableRow>
            {positionsHeaders.map((header, i) => (
              <TableCell key={header} align={i === 0 ? 'center' : 'right'}>
                <Typography variant="bodySmall">{header}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody className={styles.tableBody}>
          {positions.map((position) => (
            <TableRow key={position.id}>
              <TableCell align="center">
                <Typography variant="bodySmall">{position.symbol}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="bodySmall">{position.positionSize}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="bodySmall">{position.entryPrice}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="bodySmall">{position.liqPrice}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="bodySmall">{position.margin}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="bodySmall">{position.unrealizedPnl}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
};
