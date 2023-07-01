import classNames from 'classnames';
import type { Dispatch, SetStateAction } from 'react';
import { memo } from 'react';

import { Box, Button } from '@mui/material';

import styles from './ModifyTypeSelector.module.scss';

export enum ModifyTypeE {
  Close = 'Close',
  Add = 'Add',
  Remove = 'Remove',
}

interface ModifyTypeSelectorPropsI {
  modifyType: ModifyTypeE;
  setModifyType: Dispatch<SetStateAction<ModifyTypeE>>;
}

export const ModifyTypeSelector = memo(({ modifyType, setModifyType }: ModifyTypeSelectorPropsI) => {
  return (
    <Box className={styles.root}>
      {Object.values(ModifyTypeE).map((key) => (
        <Button
          key={key}
          className={classNames({ [styles.selected]: key === modifyType })}
          variant={key === modifyType ? 'link' : 'link'}
          onClick={() => setModifyType(key)}
        >
          {ModifyTypeE[key]}
        </Button>
      ))}
    </Box>
  );
});
