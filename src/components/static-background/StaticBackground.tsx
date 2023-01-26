import type { FC } from 'react';
import { memo } from 'react';

import styles from './StaticBackground.module.scss';

const FIGURES_ARRAY = [
  'left-top-1',
  'left-top-2',
  'left-top-3',
  'left-bottom-1',
  'left-bottom-2',
  'left-bottom-3',
  'right-top-1',
  'right-top-2',
  'right-top-3',
  'right-center-1',
  'right-center-2',
  'right-center-3',
];

export const StaticBackground: FC = memo(() => {
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
