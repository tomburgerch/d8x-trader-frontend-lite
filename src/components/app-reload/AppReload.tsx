import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CircularProgress, Typography } from '@mui/material';

import styles from './AppReload.module.scss';

export const AppReload = () => {
  const { t } = useTranslation();

  const pageReloadRef = useRef(false);

  useEffect(() => {
    if (pageReloadRef.current) {
      return;
    }

    pageReloadRef.current = true;
    setTimeout(() => {
      window.location.reload();
    });
  }, []);

  return (
    <div className={styles.root}>
      <CircularProgress size="80px" sx={{ mb: 2 }} />
      <Typography variant="h5" component="div">
        {t('common.page-reload.text1')}
      </Typography>
      <Typography variant="h6" component="div">
        {t('common.page-reload.text2')}
      </Typography>
    </div>
  );
};
