import { Splide, SplideSlide } from '@splidejs/react-splide';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { useMediaQuery, useTheme } from '@mui/material';

import { poolsAtom } from 'store/pools.store';

import { LogoCard } from './elements/logo-card/LogoCard';
import { PoolCard } from './elements/pool-card/PoolCard';

import styles from './PoolCards.module.scss';

export const PoolCards = () => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const pools = useAtomValue(poolsAtom);

  const selectItems = useMemo(() => {
    return pools.filter((pool) => pool.isRunning);
  }, [pools]);

  return (
    <div className={styles.root}>
      <Splide
        options={{
          perPage: 2,
          perMove: 1,
          arrows: false,
          gap: '12px',
          breakpoints: {
            967: {
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
        {selectItems.length === 1 && !isTablet && (
          <SplideSlide key="dummy-card">
            <LogoCard />
          </SplideSlide>
        )}
      </Splide>
    </div>
  );
};
