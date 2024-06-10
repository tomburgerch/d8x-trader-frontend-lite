import Logo from 'assets/logo.svg?react';

import styles from './LogoCard.module.scss';

export const LogoCard = () => (
  <div className={styles.root}>
    <Logo className={styles.logo} />
  </div>
);
