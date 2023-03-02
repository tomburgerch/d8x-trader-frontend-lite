import { useAtom } from 'jotai';
import { memo, useMemo } from 'react';

import {
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';

import { perpetualStatisticsAtom, positionsAtom } from 'store/pools.store';

import { EmptyTableRow } from '../empty-table-row/EmptyTableRow';
import { PositionRow } from './elements/PositionRow';

import styles from './PositionsTable.module.scss';

export const PositionsTable = memo(() => {
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);
  const [positions] = useAtom(positionsAtom);

  const positionsHeaders: Array<{ label: string; align: 'left' | 'right' }> = useMemo(
    () => [
      { label: 'Symbol', align: 'left' },
      { label: 'Pos. size', align: 'right' },
      { label: 'Side', align: 'left' },
      { label: 'Entry Price', align: 'right' },
      { label: 'Liq. price', align: 'right' },
      { label: `Margin (${perpetualStatistics?.poolName})`, align: 'right' },
      { label: 'Unr. PnL', align: 'right' },
      { label: '', align: 'left' },
    ],
    [perpetualStatistics]
  );

  return (
    <TableContainer className={styles.root}>
      <MuiTable>
        <TableHead className={styles.tableHead}>
          <TableRow>
            {positionsHeaders.map((header) => (
              <TableCell key={header.label} align={header.align}>
                <Typography variant="bodySmall">{header.label}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody className={styles.tableBody}>
          {positions.map((position) => (
            <PositionRow key={position.symbol} position={position} />
          ))}
          {positions.length === 0 && <EmptyTableRow colSpan={positionsHeaders.length} text="No open positions" />}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
});
