import { MockSWAP } from './components/mock-swap/MockSwap';

import styles from './MockSwap.module.scss';

export const MockSwap = () => {
  return (
    <div className={styles.section}>
      <div>
        <MockSWAP />
      </div>
    </div>
  );
};
