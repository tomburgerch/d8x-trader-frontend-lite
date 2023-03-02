import { useAtom } from 'jotai';
import { memo } from 'react';

import {
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';

import { positionsAtom } from 'store/pools.store';

import { PositionRow } from './elements/PositionRow';

import styles from './PositionsTable.module.scss';

const positionsHeaders = ['Symbol', 'Pos. size', 'Side', 'Entry Price', 'Liq. price', 'Margin', 'Unr. PnL', ''];

export const PositionsTable = memo(() => {
  const [positions] = useAtom(positionsAtom);

  return (
    <TableContainer className={styles.root}>
      <MuiTable>
        <TableHead className={styles.tableHead}>
          <TableRow>
            {positionsHeaders.map((header) => (
              <TableCell key={header.toString()} align="left">
                <Typography variant="bodySmall">{header}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody className={styles.tableBody}>
          {positions.map((position) => (
            <PositionRow key={position.symbol} position={position} />
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
});
