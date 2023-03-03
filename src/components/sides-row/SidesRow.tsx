import { Box, Typography } from '@mui/material';

import styles from './SidesRow.module.scss';
import { ReactNode } from 'react';

interface SidesRowPropsI {
  leftSide: ReactNode;
  rightSide: ReactNode;
}

export const SidesRow = ({ leftSide, rightSide }: SidesRowPropsI) => {
  return (
    <Box className={styles.root}>
      <Typography variant="bodySmall">{leftSide}</Typography>
      <Typography variant="bodySmall">{rightSide}</Typography>
    </Box>
  );
};
