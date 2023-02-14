import { Box, Button, Typography } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import styles from './ErrorDialog.module.scss';

interface ErrorDialogPropsI {
  errorMsg: string;
  onCloseClick: () => void;
}

export const ErrorDialog = ({ errorMsg, onCloseClick }: ErrorDialogPropsI) => {
  return (
    <Box className={styles.root}>
      <CancelOutlinedIcon className={styles.errorIcon} />
      <Typography className={styles.title}>Sorry, something went wrong</Typography>
      <Typography className={styles.errorMessage}>{errorMsg}</Typography>
      <Button onClick={onCloseClick}>Close</Button>
    </Box>
  );
};
