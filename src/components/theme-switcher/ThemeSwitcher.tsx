import classNames from 'classnames';
import { useAtom } from 'jotai';

import { DarkMode, LightMode } from '@mui/icons-material';

import { enabledDarkModeAtom } from 'store/app.store';

import styles from './ThemeSwitcher.module.scss';

export const ThemeSwitcher = () => {
  const [enabledDarkMode, setEnabledDarkMode] = useAtom(enabledDarkModeAtom);

  const toggleTheme = () => {
    setEnabledDarkMode(!enabledDarkMode);
  };

  return (
    <div className={classNames(styles.root, { [styles.isDark]: enabledDarkMode })} onClick={toggleTheme}>
      <LightMode />
      <DarkMode />
      <div className={styles.overlay}></div>
    </div>
  );
};
