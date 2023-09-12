import { useTranslation } from 'react-i18next';
import { AssetLine } from '../perpetuals/Perpetuals';
import styles from './Vault.module.scss';
import { PieChart } from 'react-minimal-pie-chart';

export const Vault = () => {
  const { t } = useTranslation();
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
          <AssetLine symbol="BTC" value={22} />
          <AssetLine symbol="ETH" value={1444} />
          <AssetLine symbol="MATIC" value={3444} />
          <AssetLine symbol="USDC" value={67888} />
        </div>
      </div>
    </>
  );
};
