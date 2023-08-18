import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useChainId } from 'wagmi';

import { Box } from '@mui/material';

import { useReferralCodes } from 'hooks/useReferralCodes';
import { getEarnedRebate, getOpenTraderRebate } from 'network/referral';
import { selectedPoolAtom } from 'store/pools.store';
import { RebateTypeE } from 'types/enums';
import { type EarnedRebateI, type OpenTraderRebateI } from 'types/types';

import { Overview, type OverviewItemI } from '../overview/Overview';
import { Disclaimer } from '../disclaimer/Disclaimer';
import { ReferralCodeBlock } from '../referral-code-block/ReferralCodeBlock';

import styles from './TraderTab.module.scss';

export const TraderTab = () => {
  const { t } = useTranslation();

  const [earnedRebates, setEarnedRebates] = useState(0);
  const [openRewards, setOpenRewards] = useState(0);

  const [selectedPool] = useAtom(selectedPoolAtom);

  const { address } = useAccount();
  const chainId = useChainId();

  const { referralCode, traderRebatePercentage, getReferralCodesAsync } = useReferralCodes(address, chainId);

  const disclaimerTextBlocks = useMemo(
    () => [t('pages.refer.trader-tab.disclaimer-text-block1'), t('pages.refer.trader-tab.disclaimer-text-block2')],
    [t]
  );

  const digestResponseData = useCallback((data: EarnedRebateI[] | OpenTraderRebateI[], type: 'rebates' | 'rewards') => {
    const setState = type === 'rebates' ? setEarnedRebates : setOpenRewards;
    const responseLength = data.length;
    if (!responseLength) {
      setState(0);
      return;
    }
    if (responseLength === 1) {
      setState(data[0].amountCC);
      return;
    }
    const cumulatedValue = data.filter((item) => item.poolId === 1).reduce((acc, currVal) => acc + currVal.amountCC, 0);
    setState(cumulatedValue);
  }, []);

  const getEarnedRebatesAsync = useCallback(async () => {
    if (address) {
      const earnedRebatesResponse = await getEarnedRebate(chainId, address, RebateTypeE.Trader);
      digestResponseData(earnedRebatesResponse.data, 'rebates');
    }
  }, [address, chainId, digestResponseData]);

  useEffect(() => {
    getEarnedRebatesAsync().then().catch(console.error);
  }, [getEarnedRebatesAsync]);

  const getOpenRewardsAsync = useCallback(async () => {
    if (address) {
      try {
        const openRewardsResponse = await getOpenTraderRebate(chainId, address);
        digestResponseData(openRewardsResponse.data, 'rewards');
      } catch (err) {
        console.error(err);
      }
    }
  }, [address, chainId, digestResponseData]);

  useEffect(() => {
    getOpenRewardsAsync().then();
  }, [getOpenRewardsAsync]);

  const overviewItems: OverviewItemI[] = [
    {
      title: t('pages.refer.trader-tab.earned-rebates'),
      value: address ? earnedRebates : '--',
      poolSymbol: selectedPool?.poolSymbol ?? '--',
    },
    {
      title: t('pages.refer.trader-tab.open-rewards'),
      value: address ? openRewards : '--',
      poolSymbol: selectedPool?.poolSymbol ?? '--',
    },
  ];

  return (
    <Box className={styles.root}>
      <Overview title={t('pages.refer.trader-tab.title1')} items={overviewItems} />
      <Disclaimer title={t('pages.refer.trader-tab.title2')} textBlocks={disclaimerTextBlocks} />
      <div className={styles.divider} />
      <ReferralCodeBlock
        referralCode={referralCode}
        traderRebatePercentage={traderRebatePercentage}
        onCodeApplySuccess={getReferralCodesAsync}
      />
    </Box>
  );
};
