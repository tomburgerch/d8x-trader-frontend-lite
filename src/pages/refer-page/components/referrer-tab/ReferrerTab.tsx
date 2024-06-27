import { useAtomValue } from 'jotai';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { collateralToSettleConversionAtom, poolsAtom } from 'store/pools.store';
import { commissionRateAtom } from 'store/refer.store';
import type { OverviewItemI, OverviewPoolItemI } from 'types/types';
import { isEnabledChain } from 'utils/isEnabledChain';

import { Disclaimer } from '../disclaimer/Disclaimer';
import { Overview } from '../overview/Overview';
import { ReferralsBlock } from '../referrals-block/ReferralsBlock';
import { useFetchEarnedRebate } from './useFetchEarnedRebate';

import styles from './ReferrerTab.module.scss';

export const ReferrerTab = memo(() => {
  const { t } = useTranslation();

  const pools = useAtomValue(poolsAtom);
  const commissionRate = useAtomValue(commissionRateAtom);
  const c2s = useAtomValue(collateralToSettleConversionAtom);

  const { address, chainId } = useAccount();

  const disclaimerTextBlocks = useMemo(
    () => [t('pages.refer.referrer-tab.disclaimer-text-block1'), t('pages.refer.referrer-tab.disclaimer-text-block2')],
    [t]
  );

  const { earnedRebates } = useFetchEarnedRebate();

  const overviewItems: OverviewItemI[] = useMemo(() => {
    const totalEarnedCommission: OverviewPoolItemI[] = [];

    pools.forEach((pool) => {
      // @DONE: totalEarnedCommission in settlement token
      const earnedCommissionAmount = earnedRebates
        .filter((rebate) => !rebate.asTrader && rebate.poolId === pool.poolId)
        .reduce((accumulator, currentValue) => accumulator + currentValue.earnings, 0);

      totalEarnedCommission.push({
        symbol: pool.settleSymbol,
        value: earnedCommissionAmount * (c2s.get(pool.poolSymbol)?.value ?? 1),
      });
    });

    return [
      {
        title: t('pages.refer.referrer-tab.total-earned-commission'),
        poolsItems: address && isEnabledChain(chainId) ? totalEarnedCommission : [],
      },
      {
        title: t('pages.refer.referrer-tab.commission-rate'),
        poolsItems:
          address && isEnabledChain(chainId)
            ? [
                {
                  value: `${commissionRate}%`,
                  symbol: '',
                },
              ]
            : [],
      },
    ];
  }, [pools, commissionRate, earnedRebates, address, chainId, c2s, t]);

  return (
    <div className={styles.root}>
      <Overview title={t('pages.refer.referrer-tab.title1')} items={overviewItems} />
      <Disclaimer title={t('pages.refer.referrer-tab.title2')} textBlocks={disclaimerTextBlocks} />
      <div className={styles.divider} />
      <ReferralsBlock />
    </div>
  );
});
