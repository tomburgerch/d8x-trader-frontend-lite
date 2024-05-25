import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from '@mui/material';

import { strategyPerpetualStatsAtom, strategyPositionAtom } from 'store/strategies.store';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './Overview.module.scss';

export const Overview = () => {
  const { t } = useTranslation();

  const strategyPosition = useAtomValue(strategyPositionAtom);
  const strategyPerpetualStats = useAtomValue(strategyPerpetualStatsAtom);

  const syntheticPositionUSD = useMemo(() => {
    if (strategyPosition) {
      return strategyPosition.positionNotionalBaseCCY * strategyPosition.entryPrice;
    }
  }, [strategyPosition]);

  return (
    <div className={styles.root}>
      <Typography variant="h4" className={styles.title}>
        {t('pages.strategies.overview.title')}
      </Typography>
      <div className={styles.dataBlock}>
        <div key="synthetic-position" className={styles.dataItem}>
          <Typography variant="bodyTiny" component="p" className={styles.dataTitle}>
            {t('pages.strategies.overview.synthetic-position')}
          </Typography>
          <Typography variant="bodyMedium" className={styles.dataValue}>
            {syntheticPositionUSD ? formatToCurrency(syntheticPositionUSD, 'USD') : '-'}
          </Typography>
        </div>
        <div key="your-yield" className={styles.dataItem}>
          <Typography variant="bodyTiny" component="p" className={styles.dataTitle}>
            {t('pages.strategies.overview.your-yield')}
          </Typography>
          <Typography variant="bodyMedium" className={styles.dataValue}>
            {strategyPosition && strategyPerpetualStats && syntheticPositionUSD ? (
              <>
                <span>{t('pages.strategies.overview.eth-apr')}</span>
                {formatToCurrency(
                  (strategyPosition?.collateralCC * 3.4 * strategyPerpetualStats.indexPrice) / syntheticPositionUSD,
                  '%',
                  false,
                  2
                )}
              </>
            ) : (
              '-'
            )}
          </Typography>
          <Typography variant="bodyMedium" className={styles.dataValue}>
            {strategyPerpetualStats && syntheticPositionUSD ? (
              <>
                <span>{t('pages.strategies.overview.d8x-apr')}</span>
                {formatToCurrency((strategyPerpetualStats.currentFundingRateBps / 100 / 8) * 365 * 24, '%')}
              </>
            ) : (
              '-'
            )}
          </Typography>
          <Typography variant="bodyMedium" className={styles.dataValue}>
            <>
              <span>{t('pages.strategies.overview.your-points')}</span>
            </>
          </Typography>
          <Typography variant="bodyMedium" className={styles.dataValue}>
            <>
              <span>{t('pages.strategies.overview.your-points-2')}</span>
            </>
          </Typography>
          <Typography variant="bodyMedium" className={styles.dataValue}>
            <>
              <span>{t('pages.strategies.overview.your-points-3')}</span>
            </>
          </Typography>
        </div>
      </div>
    </div>
  );
};
