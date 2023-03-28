import { Box, Typography } from '@mui/material';

import styles from './ToastContent.module.scss';
import { SidesRow } from '../sides-row/SidesRow';

interface ToastContentPropsI {
  title: string;
  bodyLines: { label: string; value: string }[];
}

export const ToastContent = ({ title, bodyLines }: ToastContentPropsI) => {
  return (
    <Box className={styles.root}>
      <Typography variant="bodyMedium">{title}</Typography>
      <Box className={styles.body}>
        {bodyLines.map(({ label, value }) => (
          <SidesRow key={`${label}-${value}`} leftSide={label} rightSide={value} />
        ))}
      </Box>
    </Box>
  );
};
