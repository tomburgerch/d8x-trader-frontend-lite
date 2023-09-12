import { useTranslation } from 'react-i18next';
import styles from './AccountValue.module.scss';

export const AccountValue = () => {
  const { t } = useTranslation();

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
          <div className={styles.detailsValue}>$233</div>
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
          <div className={styles.detailsValue}>$233</div>
        </div>
      </div>
      <div className={styles.detailsContainer}>
        <div className={styles.detailsHeader}>{t('pages.portfolio.account-value.details.vault.title')}</div>
        <div className={styles.separator} />
        <div className={styles.detailsLine}>
          <div>{t('pages.portfolio.account-value.details.vault.assets')}</div>
          <div className={styles.detailsValue}>$238881</div>
        </div>
        <div className={styles.detailsLine}>
          <div>{t('pages.portfolio.account-value.details.vault.total')}</div>
          <div className={styles.detailsValue}>$19887</div>
        </div>
      </div>
    </div>
  );
};
