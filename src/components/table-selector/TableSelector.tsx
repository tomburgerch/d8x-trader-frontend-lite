import { useState } from 'react';
import classnames from 'classnames';

import { Box, Typography } from '@mui/material';

import styles from './TableSelector.module.scss';

export interface SelectorItemI {
  label: string;
  item: JSX.Element;
}

interface TableSelectorPropsI {
  selectorItems: SelectorItemI[];
}

export const TableSelector = ({ selectorItems }: TableSelectorPropsI) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Box className={styles.root}>
      <Box className={styles.selectorTabs}>
        {selectorItems.map(({ label }, index) => (
          <Box
            key={label}
            onClick={() => setActiveIndex(index)}
            className={classnames(styles.tabLabelWrapper, { [styles.inactiveTabLabel]: index !== activeIndex })}
          >
            <Typography variant="bodySmall">{label}</Typography>
          </Box>
        ))}
      </Box>
      {selectorItems[activeIndex].item}
    </Box>
  );
};
