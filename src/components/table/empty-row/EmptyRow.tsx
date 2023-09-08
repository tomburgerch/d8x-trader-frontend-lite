import { TableCell, TableRow, Typography } from '@mui/material';

import styles from './EmptyRow.module.scss';

interface EmptyRowPropsI {
  colSpan: number;
  text: string;
}

export const EmptyRow = ({ colSpan, text }: EmptyRowPropsI) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center">
        <Typography variant="cellSmall" className={styles.emptyText}>
          {text}
        </Typography>
      </TableCell>
    </TableRow>
  );
};
