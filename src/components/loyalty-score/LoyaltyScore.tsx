import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { Box, Typography } from '@mui/material';

import { ReactComponent as EmptyStar } from 'assets/starEmpty.svg';
import { ReactComponent as FilledStar } from 'assets/starFilled.svg';
import { getTraderLoyalty } from 'network/network';
import { loyaltyScoreAtom } from 'store/pools.store';

import styles from './LoyaltyScore.module.scss';

const loyaltyMap: Record<number, string> = {
  1: 'Diamond',
  2: 'Platinum',
  3: 'Gold',
  4: 'Silver',
  5: '-',
};

export const LoyaltyScore = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const [loyaltyScore, setLoyaltyScore] = useAtom(loyaltyScoreAtom);

  useEffect(() => {
    if (address) {
      getTraderLoyalty(chainId, address).then((data) => {
        setLoyaltyScore(data.data);
      });
    } else {
      setLoyaltyScore(5);
    }
  }, [chainId, address, setLoyaltyScore]);

  return (
    <Box className={styles.root}>
      <Box className={styles.starsHolder}>
        {loyaltyScore < 5 ? <FilledStar /> : <EmptyStar />}
        {loyaltyScore < 4 ? <FilledStar /> : <EmptyStar />}
        {loyaltyScore < 3 ? <FilledStar /> : <EmptyStar />}
        {loyaltyScore < 2 ? <FilledStar /> : <EmptyStar />}
      </Box>
      <Typography className={styles.loyalty}>{loyaltyMap[loyaltyScore]}</Typography>
    </Box>
  );
};
