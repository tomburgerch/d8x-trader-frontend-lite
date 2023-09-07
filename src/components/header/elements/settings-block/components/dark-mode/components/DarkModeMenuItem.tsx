import classnames from 'classnames';

import { MenuItem } from '@mui/material';

import styles from './DarkModeMenuItem.module.scss';

export interface DarkModeMenuItemPropsI {
  option: string;
  isActive: boolean;
  onClick: () => void;
}

export const DarkModeMenuItem = ({ option, isActive, onClick }: DarkModeMenuItemPropsI) => (
  <MenuItem onClick={onClick} className={classnames('notranslate', { [styles.selected]: isActive })}>
    {option}
  </MenuItem>
);
