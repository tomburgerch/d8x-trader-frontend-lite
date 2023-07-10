import { useAccount } from 'wagmi';
import { useAtom } from 'jotai';

import { Box } from '@mui/material';

import { selectedPoolAtom } from 'store/pools.store';

import { Overview, type OverviewItemI } from '../overview/Overview';
import { Disclaimer } from '../disclaimer/Disclaimer';

import styles from './ReferrerTab.module.scss';

const disclaimerTextBlocks = [
  'Earn rebates by inviting traders to trade on D8X. Rebates are airdropped to your wallet weekly.',
  'Check out details on the D8X referral program.',
];

export const ReferrerTab = () => {
  const [selectedPool] = useAtom(selectedPoolAtom);

  const { address } = useAccount();
  // TODO: MJO: Change hardcoded values
  const overviewItems: OverviewItemI[] = [
    {
      title: 'Total referred trading volume',
      value: address ? 99999 : '--',
      poolSymbol: selectedPool?.poolSymbol ?? '--',
    },
    { title: 'Total earned rebates', value: address ? 23455 : '--', poolSymbol: selectedPool?.poolSymbol ?? '--' },
  ];

  return (
    <Box className={styles.root}>
      <Overview title="Your referrals" items={overviewItems} />
      <Disclaimer title="Refer & Earn" textBlocks={disclaimerTextBlocks} />
      <div className={styles.divider} />
    </Box>
  );
};
