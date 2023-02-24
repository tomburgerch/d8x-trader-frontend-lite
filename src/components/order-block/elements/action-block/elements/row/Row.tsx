import { Box, Typography } from '@mui/material';

import styles from './Row.module.scss';
import { ReactNode } from 'react';

interface RowPropsI {
  leftSide: ReactNode;
  rightSide: ReactNode;
}

export const Row = ({ leftSide, rightSide }: RowPropsI) => {
  return (
    <Box className={styles.root}>
      <Typography variant="bodySmall">{leftSide}</Typography>
      <Typography variant="bodySmall">{rightSide}</Typography>
    </Box>
  );
};
