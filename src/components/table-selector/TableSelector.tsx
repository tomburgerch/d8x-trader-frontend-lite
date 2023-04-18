import classnames from 'classnames';
import type { Dispatch, SetStateAction } from 'react';

import { Box, Button, Card, CardContent, CardHeader } from '@mui/material';

import styles from './TableSelector.module.scss';

export interface SelectorItemI {
  label: string;
  item: JSX.Element;
}

interface TableSelectorPropsI {
  selectorItems: SelectorItemI[];
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
}

export const TableSelector = ({ selectorItems, activeIndex, setActiveIndex }: TableSelectorPropsI) => {
  return (
    <Card className={styles.root}>
      <CardHeader
        className={styles.header}
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
};
