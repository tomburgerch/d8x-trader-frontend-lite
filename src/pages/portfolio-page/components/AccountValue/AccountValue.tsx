import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useChainId } from 'wagmi';

import { useFetchOpenRewards } from 'pages/refer-page/components/trader-tab/useFetchOpenRewards';
import { traderAPIAtom } from 'store/pools.store';

import styles from './AccountValue.module.scss';
import {
  fetchPositionsAtom,
  poolShareTokensUSDBalanceAtom,
  poolTokensUSDBalanceAtom,
  totalEstimatedEarningsAtom,
  totalUnrealizedPnLAtom,
} from './fetchEverything';

const formatCurrency = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 });

export const AccountValue = () => {
  const { t } = useTranslation();
  const { address } = useAccount();
  const chainId = useChainId();

  const { openRewards } = useFetchOpenRewards();

  const [traderAPI] = useAtom(traderAPIAtom);
  const [poolTokensUSDBalance] = useAtom(poolTokensUSDBalanceAtom);
  const [poolShareTokensUSDBalance] = useAtom(poolShareTokensUSDBalanceAtom);
  const [totalUnrealizedPnL] = useAtom(totalUnrealizedPnLAtom);
  const [totalEstimatedEarnings] = useAtom(totalEstimatedEarningsAtom);
  const [{ openRewardsByPools }, fetchPositions] = useAtom(fetchPositionsAtom);

  const totalReferralRewards = useMemo(
    () => openRewardsByPools.reduce((acc, curr) => acc + Number(curr.value), 0),
    [openRewardsByPools]
  );

  useEffect(() => {
    if (traderAPI) {
      // eslint-disable-next-line
      fetchPositions(address!, chainId, openRewards);
    }
  }, [openRewards, traderAPI, address, chainId, fetchPositions]);
  return (
    <div className={styles.sideBlock}>
      <div>
        <div className={styles.detailsHeader}>{t('pages.portfolio.account-value.title')}</div>
        <div className={styles.accountValue}>$99999.23</div>
      </div>

      <div className={styles.detailsContainer}>
        <div className={styles.detailsHeader}>{t('pages.portfolio.account-value.details.wallet.title')}</div>
        <div className={styles.separator} />
        <div className={styles.detailsLine}>
          <div>{t('pages.portfolio.account-value.details.wallet.funds')}</div>
          <div className={styles.detailsValue}>${formatCurrency(poolTokensUSDBalance)}</div>
        </div>
      </div>
      <div className={styles.detailsContainer}>
        <div className={styles.detailsHeader}>{t('pages.portfolio.account-value.details.perps.title')}</div>
        <div className={styles.separator} />
        <div className={styles.detailsLine}>
          <div>{t('pages.portfolio.account-value.details.perps.leverage')}</div>
          <div className={styles.detailsValue}>12.21x</div>
        </div>
        <div className={styles.detailsLine}>
          <div>{t('pages.portfolio.account-value.details.perps.unrealized')}</div>
          <div className={styles.detailsValue}>
            {totalUnrealizedPnL < 0
              ? '-$' + formatCurrency(Math.abs(totalUnrealizedPnL))
              : '$' + formatCurrency(totalUnrealizedPnL)}
          </div>
        </div>
        <div className={styles.detailsLine}>
          <div>{t('pages.portfolio.account-value.details.perps.referral')}</div>
          <div className={styles.detailsValue}>${formatCurrency(totalReferralRewards)}</div>
        </div>
      </div>
      <div className={styles.detailsContainer}>
        <div className={styles.detailsHeader}>{t('pages.portfolio.account-value.details.vault.title')}</div>
        <div className={styles.separator} />
        <div className={styles.detailsLine}>
          <div>{t('pages.portfolio.account-value.details.vault.assets')}</div>
          <div className={styles.detailsValue}>${formatCurrency(poolShareTokensUSDBalance)}</div>
        </div>
        <div className={styles.detailsLine}>
          <div>{t('pages.portfolio.account-value.details.vault.total')}</div>
          <div className={styles.detailsValue}>${formatCurrency(totalEstimatedEarnings)}</div>
        </div>
      </div>
    </div>
  );
};
