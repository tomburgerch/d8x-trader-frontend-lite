import { memo } from 'react';

import { Box } from '@mui/material';

import styles from './Separator.module.scss';

export const Separator = memo(() => {
  return <Box className={styles.root} />;
});
