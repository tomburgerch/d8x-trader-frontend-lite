import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Build } from '@mui/icons-material';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

import styles from './SettingsBlock.module.scss';
import { DarkModeSwitcher } from './components/dark-mode/DarkModeSwitcher';
import { DefaultCurrencySwitcher } from './components/default-currency/DefaultCurrencySwitcher';
import { OrderBlockSwitcher } from './components/order-block/OrderBlockSwitcher';

export const SettingsBlock = memo(() => {
  const { t } = useTranslation();

  const theme = useTheme();
  const isBigScreen = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <Box className={styles.root}>
      <Box className={styles.labelRow}>
        <Typography variant="bodyMedium" className={styles.label}>
          <Build className={styles.labelIcon} />
          {t('common.settings.ui-settings.title')}
        </Typography>
      </Box>
      {isBigScreen && (
        <Box className={styles.optionRow}>
          <Typography variant="bodyMedium" className={styles.setting}>
            {t('common.settings.ui-settings.order-block.title')}
          </Typography>
          <OrderBlockSwitcher />
        </Box>
      )}
      <Box className={styles.optionRow}>
        <Typography variant="bodyMedium" className={styles.setting}>
          {t('common.settings.ui-settings.dark-mode.title')}
        </Typography>
        <DarkModeSwitcher />
      </Box>
      <Box className={styles.optionRow}>
        <Typography variant="bodyMedium" className={styles.setting}>
          {t('common.settings.ui-settings.default-currency.title')}
        </Typography>
        <DefaultCurrencySwitcher />
      </Box>
    </Box>
  );
});
