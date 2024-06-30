import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

import { AssetLine } from 'components/asset-line/AssetLine';
import { realizedPnLListAtom } from 'pages/portfolio-page/store/fetchRealizedPnL';
import { unrealizedPnLListAtom } from 'pages/portfolio-page/store/fetchUnrealizedPnL';
import { formatCurrency } from 'utils/formatCurrency';

import styles from './Perpetuals.module.scss';
import { collateralToSettleConversionAtom } from 'store/pools.store';

export const Perpetuals = () => {
  const { t } = useTranslation();

  const c2s = useAtomValue(collateralToSettleConversionAtom);
  const unrealizedPnLList = useAtomValue(unrealizedPnLListAtom);
  const realizedPnLList = useAtomValue(realizedPnLListAtom);

  return (
    <>
      <div className={styles.pnlBlock}>
        <div className={styles.pnlHeader}>{t('pages.portfolio.account-value.details.perps.realized')}</div>
        <div className={styles.assetsList}>
          {realizedPnLList.length
            ? realizedPnLList.map((token) => (
                <AssetLine
                  key={token.symbol}
                  symbol={token.settleSymbol}
                  value={formatCurrency(token.value * (c2s.get(token.symbol)?.value ?? 1))}
                />
              ))
            : 'No data'}
        </div>
      </div>
      <div className={styles.pnlBlock}>
        <div className={styles.pnlHeader}>{t('pages.portfolio.account-value.details.perps.unrealized')}</div>
        <div className={styles.assetsList}>
          {unrealizedPnLList.length
            ? unrealizedPnLList.map((token) => (
                <AssetLine
                  key={token.symbol}
                  symbol={token.settleSymbol}
                  value={formatCurrency(token.value * (c2s.get(token.symbol)?.value ?? 1))}
                />
              ))
            : 'No data'}
        </div>
      </div>
    </>
  );
};
