import classnames from 'classnames';

import { MenuItem } from '@mui/material';

import styles from './DefaultCurrencyMenuItem.module.scss';

export interface DefaultCurrencyMenuItemPropsI {
  option: string;
  isActive: boolean;
  onClick: () => void;
}

export const DefaultCurrencyMenuItem = ({ option, isActive, onClick }: DefaultCurrencyMenuItemPropsI) => (
  <MenuItem onClick={onClick} className={classnames('notranslate', { [styles.selected]: isActive })}>
    {option}
  </MenuItem>
);
