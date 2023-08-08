import classnames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Typography } from '@mui/material';

import styles from './TabSelector.module.scss';

interface TabSelectorPropsI {
  activeTab: number;
  onTabChange: (newIndex: number) => void;
}

export const TabSelector = ({ activeTab, onTabChange }: TabSelectorPropsI) => {
  const { t } = useTranslation();

  const tabItems = useMemo(() => [t('pages.refer.tab-selector.referrer'), t('pages.refer.tab-selector.trader')], [t]);

  return (
    <Box className={styles.root}>
      {tabItems.map((tab, index) => (
        <Box
          key={tab}
          onClick={() => onTabChange(index)}
          className={classnames(styles.tab, {
            [styles.active]: index === activeTab,
            [styles.inactive]: index !== activeTab,
          })}
        >
          <Typography variant="bodyMedium">{tab}</Typography>
        </Box>
      ))}
    </Box>
  );
};
