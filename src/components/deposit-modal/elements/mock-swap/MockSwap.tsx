import { MockSWAP } from './components/mock-swap/MockSwap';

import styles from './MockSwap.module.scss';

export const MockSwap = () => {
  return (
    <div className={styles.section}>
      <div className={styles.header}>GET TEST TOKENS</div>
      <div className={styles.subtitle}>Mint test USDC</div>
      <div>
        <MockSWAP />
      </div>
    </div>
  );
};
