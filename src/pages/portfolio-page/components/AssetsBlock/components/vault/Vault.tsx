import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart } from 'react-minimal-pie-chart';

import { useFetchEarnedRebate } from 'pages/refer-page/components/referrer-tab/useFetchEarnedRebate';
import { poolsAtom } from 'store/pools.store';
import { RebateTypeE } from 'types/enums';
import { OverviewPoolItemI } from 'types/types';

import { AssetLine } from '../perpetuals/Perpetuals';
import styles from './Vault.module.scss';

export const Vault = () => {
  const { t } = useTranslation();

  const [pools] = useAtom(poolsAtom);

  const { earnedRebates } = useFetchEarnedRebate(RebateTypeE.Trader);

  const overviewItems = useMemo(() => {
    const earnedRebatesByPools: OverviewPoolItemI[] = [];

    pools.forEach((pool) => {
      const earnedRebatesAmount = earnedRebates
        .filter((rebate) => rebate.poolId === pool.poolId)
        .reduce((accumulator, currentValue) => accumulator + currentValue.amountCC, 0);

      earnedRebatesByPools.push({ poolSymbol: pool.poolSymbol, value: earnedRebatesAmount });
    });

    return earnedRebatesByPools;
  }, [pools, earnedRebates]);

  return (
    <>
      <div className={styles.pnlBlock}>
        <div className={styles.pnlHeader}>{t('pages.portfolio.account-value.details.vault.assets-pool')}</div>
        <div className={styles.chartBlock}>
          <PieChart
            className={styles.pie}
            data={[
              { title: 'BTC', value: 40, color: '#6649DF' },
              { title: 'ETH', value: 30, color: '#FDA13A' },
              { title: 'MATIC', value: 20, color: '#F24141' },
              { title: 'USDC', value: 10, color: '#515151' },
            ]}
            startAngle={-90}
            paddingAngle={1}
            lineWidth={25}
          />
          <div className={styles.assetsList}>
            <AssetLine symbol="BTC" value="40%" />
            <AssetLine symbol="ETH" value="30%" />
            <AssetLine symbol="MATIC" value="20%" />
            <AssetLine symbol="USDC" value="10%" />
          </div>
        </div>
      </div>
      <div className={styles.pnlBlock}>
        <div className={styles.pnlHeader}>{t('pages.portfolio.account-value.details.vault.earnings-pool')}</div>
        <div className={styles.assetsList}>
          {overviewItems.map((rebate) => (
            <AssetLine key={rebate.poolSymbol} symbol={rebate.poolSymbol} value={rebate.value} />
          ))}
        </div>
      </div>
    </>
  );
};
