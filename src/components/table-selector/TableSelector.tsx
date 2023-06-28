import classnames from 'classnames';

import { Box, Button, Card, CardContent, CardHeader } from '@mui/material';

import styles from './TableSelector.module.scss';

export interface SelectorItemI {
  label: string;
  item: JSX.Element;
}

interface TableSelectorPropsI {
  selectorItems: SelectorItemI[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const TableSelector = ({ selectorItems, activeIndex, setActiveIndex }: TableSelectorPropsI) => {
  return (
    <Card className={styles.root}>
      <CardHeader
        title={
          <Box className={styles.tableSelectorsWrapper}>
            {selectorItems.map(({ label }, index) => (
              <Button
                key={label}
                variant="link"
                onClick={() => setActiveIndex(index)}
                className={classnames({ [styles.selected]: activeIndex === index })}
              >
                {label}
              </Button>
            ))}
          </Box>
        }
      />
      <CardContent className={styles.content}>{selectorItems[activeIndex].item}</CardContent>
    </Card>
  );
};
