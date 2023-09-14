import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart } from 'react-minimal-pie-chart';

import { poolShareTokensShareAtom } from 'pages/portfolio-page/components/AccountValue/fetchEverything';
import { useFetchEarnedRebate } from 'pages/refer-page/components/referrer-tab/useFetchEarnedRebate';
import { poolsAtom } from 'store/pools.store';
import { RebateTypeE } from 'types/enums';
import { OverviewPoolItemI } from 'types/types';

import { AssetLine } from '../perpetuals/Perpetuals';
import styles from './Vault.module.scss';

const colorsArray = ['#6649DF', '#FDA13A', '#F24141', '#515151'];

export const Vault = () => {
  const { t } = useTranslation();

  const [pools] = useAtom(poolsAtom);
  const [poolShareTokensShare] = useAtom(poolShareTokensShareAtom);

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
            data={poolShareTokensShare.map((share, index) => ({
              title: share.balance,
              value: share.percent * 100,
              color: colorsArray[index % colorsArray.length],
            }))}
            startAngle={-90}
            paddingAngle={1}
            lineWidth={25}
          />
          <div className={styles.assetsList}>
            {poolShareTokensShare.map((share) => (
              <AssetLine key={share.symbol} symbol={share.symbol} value={`${(share.percent * 100).toFixed(2)}%`} />
            ))}
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
