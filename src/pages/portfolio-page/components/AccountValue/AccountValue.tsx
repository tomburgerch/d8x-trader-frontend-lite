import { useAtom } from 'jotai';
import { useFetchOpenRewards } from 'pages/refer-page/components/trader-tab/useFetchOpenRewards';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { traderAPIAtom } from 'store/pools.store';
import { useAccount } from 'wagmi';
import styles from './AccountValue.module.scss';
import { fetchPositionsAtom, poolShareTokensUSDBalanceAtom, poolTokensUSDBalanceAtom } from './fetchEverything';

const formatCurrency = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 });

export const AccountValue = () => {
  const { t } = useTranslation();
  const { address } = useAccount();

  const { openRewards } = useFetchOpenRewards();

  const [traderAPI] = useAtom(traderAPIAtom);
  const [poolTokensUSDBalance] = useAtom(poolTokensUSDBalanceAtom);
  const [poolShareTokensUSDBalance] = useAtom(poolShareTokensUSDBalanceAtom);
  const [{ openRewardsByPools }, fetchPositions] = useAtom(fetchPositionsAtom);

  const totalEstimEarning = useMemo(
    () => openRewardsByPools.reduce((acc, curr) => acc + Number(curr.value), 0),
    [openRewardsByPools]
  );

  useEffect(() => {
    if (traderAPI) {
      // eslint-disable-next-line
      fetchPositions(address!, openRewards);
    }
  }, [openRewards, traderAPI, address, fetchPositions]);
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
          <div className={styles.detailsValue}>$233222</div>
        </div>
        <div className={styles.detailsLine}>
          <div>{t('pages.portfolio.account-value.details.perps.referral')}</div>
          <div className={styles.detailsValue}>${formatCurrency(totalEstimEarning)}</div>
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
          <div className={styles.detailsValue}>${formatCurrency(totalEstimEarning)}</div>
        </div>
      </div>
    </div>
  );
};
