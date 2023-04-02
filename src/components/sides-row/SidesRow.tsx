import type { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';

import styles from './SidesRow.module.scss';

interface SidesRowPropsI {
  leftSide: ReactNode;
  rightSide: ReactNode;
  leftSideStyles?: string;
  rightSideStyles?: string;
}

export const SidesRow = ({ leftSide, leftSideStyles, rightSide, rightSideStyles }: SidesRowPropsI) => {
  return (
    <Box className={styles.root}>
      <Typography variant="bodySmall" className={leftSideStyles}>
        {leftSide}
      </Typography>
      <Typography variant="bodySmall" className={rightSideStyles}>
        {rightSide}
      </Typography>
    </Box>
  );
};
