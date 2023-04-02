import { useState } from 'react';
import classnames from 'classnames';

import { Box, Button, Card, CardContent, CardHeader, Typography, useMediaQuery, useTheme } from '@mui/material';

import styles from './TableSelector.module.scss';

export interface SelectorItemI {
  label: string;
  item: JSX.Element;
}

interface TableSelectorPropsI {
  selectorItems: SelectorItemI[];
}

export const TableSelector = ({ selectorItems }: TableSelectorPropsI) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [activeIndex, setActiveIndex] = useState(0);

  if (isSmallScreen) {
    return (
      <Card className={styles.mobileRoot}>
        <CardHeader
          className={styles.mobileRootHeader}
          title={
            <Box className={styles.rootOptions}>
              {selectorItems.map(({ label }, index) => (
                <Button
                  key={label}
                  className={classnames({ [styles.selected]: index === activeIndex })}
                  onClick={() => setActiveIndex(index)}
                >
                  {label}
                </Button>
              ))}
            </Box>
          }
        />
        <CardContent>{selectorItems[activeIndex].item}</CardContent>
      </Card>
    );
  }

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
