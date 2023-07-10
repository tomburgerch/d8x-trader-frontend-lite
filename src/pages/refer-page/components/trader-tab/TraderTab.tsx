import { useAccount } from 'wagmi';
import { useAtom } from 'jotai';

import { Box } from '@mui/material';

import { selectedPoolAtom } from 'store/pools.store';

import { Overview, type OverviewItemI } from '../overview/Overview';
import { Disclaimer } from '../disclaimer/Disclaimer';
import { ReferralCodeBlock } from '../referral-code-block/ReferralCodeBlock';

import styles from './TraderTab.module.scss';

const disclaimerTextBlocks = [
  'Enter a referral code to receive discounts on trading fees.',
  'The discounts are airdropped weekly to your wallet.',
];

export const TraderTab = () => {
  const [selectedPool] = useAtom(selectedPoolAtom);

  const { address } = useAccount();

  // TODO: MJO: Change hardcoded values
  const overviewItems: OverviewItemI[] = [
    { title: 'Total earned rebates', value: address ? 23455 : '--', poolSymbol: selectedPool?.poolSymbol ?? '--' },
    { title: 'Open rewards', value: address ? 256 : '--', poolSymbol: selectedPool?.poolSymbol ?? '--' },
  ];

  return (
    <Box className={styles.root}>
      <Overview title="Your discounts" items={overviewItems} />
      <Disclaimer title="Trade & Earn" textBlocks={disclaimerTextBlocks} />
      <div className={styles.divider} />
      <ReferralCodeBlock />
    </Box>
  );
};
