import { memo } from 'react';

import styles from './StaticBackground.module.scss';

const FIGURES_ARRAY = ['left-top-1', 'right-top-1', 'center-bottom-1', 'center-bottom-2'];

export const StaticBackground = memo(() => {
  return (
    <div className={styles.root}>
      <ul className={styles.figures}>
        {FIGURES_ARRAY.map((name) => (
          <li key={name} data-role={name} />
        ))}
      </ul>
    </div>
  );
});
