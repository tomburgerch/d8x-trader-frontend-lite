import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

import { Box, Typography } from '@mui/material';

import { ReactComponent as EmptyStar } from 'assets/starEmpty.svg';
import { ReactComponent as FilledStar } from 'assets/starFilled.svg';
import { getTraderLoyalty } from 'network/network';
import { loyaltyScoreAtom } from 'store/pools.store';

import styles from './LoyaltyScore.module.scss';

const loyaltyMap: Record<number, string> = {
  0: '-',
  1: 'Silver',
  2: 'Gold',
  3: 'Platinum',
  4: 'Diamond',
};

export const LoyaltyScore = () => {
  const { address } = useAccount();

  const [loyaltyScore, setLoyaltyScore] = useAtom(loyaltyScoreAtom);

  useEffect(() => {
    if (address) {
      getTraderLoyalty(address).then((data) => {
        setLoyaltyScore(data.data);
      });
    } else {
      setLoyaltyScore(0);
    }
  }, [address, setLoyaltyScore]);

  return (
    <Box className={styles.root}>
      <Box className={styles.starsHolder}>
        {loyaltyScore > 0 ? <FilledStar /> : <EmptyStar />}
        {loyaltyScore > 1 ? <FilledStar /> : <EmptyStar />}
        {loyaltyScore > 2 ? <FilledStar /> : <EmptyStar />}
        {loyaltyScore > 3 ? <FilledStar /> : <EmptyStar />}
      </Box>
      <Typography className={styles.loyalty}>{loyaltyMap[loyaltyScore]}</Typography>
    </Box>
  );
};
