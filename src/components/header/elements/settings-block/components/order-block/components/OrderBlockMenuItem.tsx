import classnames from 'classnames';

import { MenuItem } from '@mui/material';

import styles from './OrderBlockMenuItem.module.scss';

export interface OrderBlockMenuItemPropsI {
  option: string;
  isActive: boolean;
  onClick: () => void;
}

export const OrderBlockMenuItem = ({ option, isActive, onClick }: OrderBlockMenuItemPropsI) => (
  <MenuItem onClick={onClick} className={classnames('notranslate', { [styles.selected]: isActive })}>
    {option}
  </MenuItem>
);
