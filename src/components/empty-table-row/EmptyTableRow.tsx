import { TableCell, TableRow, Typography } from '@mui/material';

import styles from './EmptyTableRow.module.scss';

interface EmptyTableRowPropsI {
  colSpan: number;
  text: string;
}

export const EmptyTableRow = ({ colSpan, text }: EmptyTableRowPropsI) => {
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
