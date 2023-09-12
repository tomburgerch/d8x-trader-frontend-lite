import { Suspense } from 'react';
import { getDynamicLogo } from 'utils/tokens';
import styles from './Perpetuals.module.scss';
import { useTranslation } from 'react-i18next';

interface AssetLinePropsI {
  symbol: string;
  value: string | number;
}

export const AssetLine = ({ symbol, value }: AssetLinePropsI) => {
  const IconComponent = getDynamicLogo(symbol.toLowerCase());
  return (
    <div className={styles.assetsLine}>
      <Suspense fallback={null}>
        <IconComponent width={24} height={24} />
      </Suspense>
      <div style={{ flex: '1' }}>{symbol}</div>
      <div>{value}</div>
    </div>
  );
};

export const Perpetuals = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.pnlBlock}>
        <div className={styles.pnlHeader}>{t('pages.portfolio.account-value.details.perps.realized')}</div>
        <div className={styles.assetsList}>
          <AssetLine symbol="BTC" value={22} />
          <AssetLine symbol="ETH" value={1444} />
          <AssetLine symbol="MATIC" value={3444} />
          <AssetLine symbol="USDC" value={67888} />
        </div>
      </div>
      <div className={styles.pnlBlock}>
        <div className={styles.pnlHeader}>{t('pages.portfolio.account-value.details.perps.unrealized')}</div>
        <div className={styles.assetsList}>
          <AssetLine symbol="BTC" value={22} />
          <AssetLine symbol="ETH" value={1444} />
          <AssetLine symbol="MATIC" value={3444} />
          <AssetLine symbol="USDC" value={67888} />
        </div>
      </div>
    </>
  );
};
