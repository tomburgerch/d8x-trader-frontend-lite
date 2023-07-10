import classnames from 'classnames';

import { Box, Typography } from '@mui/material';

import styles from './TabSelector.module.scss';

interface TabSelectorPropsI {
  activeTab: number;
  onTabChange: (newIndex: number) => void;
}

const tabItems = ['As Referrer', 'As Trader'];

export const TabSelector = ({ activeTab, onTabChange }: TabSelectorPropsI) => {
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
