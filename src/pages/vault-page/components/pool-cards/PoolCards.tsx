import { Splide, SplideSlide } from '@splidejs/react-splide';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo } from 'react';

import { poolsAtom } from 'store/pools.store';

import { PoolCard } from './elements/pool-card/PoolCard';

import styles from './PoolCards.module.scss';

export const PoolCards = () => {
  const pools = useAtomValue(poolsAtom);

  const selectItems = useMemo(() => {
    return pools.filter((pool) => pool.isRunning);
  }, [pools]);

  useEffect(() => {
    console.log({ selectItems });
  }, [selectItems]);

  return (
    <div className={styles.root}>
      <Splide
        options={{
          perPage: 2,
          perMove: 1,
          arrows: false,
          gap: '12px',
          padding: '8px',
          breakpoints: {
            904: {
              perPage: 1,
            },
          },
        }}
      >
        {selectItems.map((pool) => (
          <SplideSlide key={pool.poolSymbol}>
            <PoolCard pool={pool} />
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
};
