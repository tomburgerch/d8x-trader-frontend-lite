import type { DialogProps } from '@mui/material';
import { Box, CircularProgress, Dialog as MuiDialog } from '@mui/material';

import { ErrorDialog } from './ErrorDialog';

import styles from './Dialog.module.scss';

interface DialogPropsI extends DialogProps {
  loading?: boolean;
  errorMsg?: string;
  onCloseClick?: () => void;
}

export const Dialog = ({ open, loading, errorMsg, children, onCloseClick, ...rest }: DialogPropsI) => {
  return (
    <MuiDialog open={open} {...rest}>
      {loading && (
        <Box className={styles.loaderWrapper}>
          <CircularProgress />
        </Box>
      )}
      {errorMsg && onCloseClick && <ErrorDialog errorMsg={errorMsg} onCloseClick={onCloseClick} />}
      {!loading && !errorMsg && children}
    </MuiDialog>
  );
};
