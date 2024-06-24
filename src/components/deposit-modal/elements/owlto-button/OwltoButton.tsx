import { useTranslation } from 'react-i18next';

import { Button, Link } from '@mui/material';

import styles from '../../DepositModal.module.scss';

export const OwltoButton = () => {
  const { t } = useTranslation();

  return (
    <Link
      href="https://owlto.finance/bridge?channel=28573"
      target="_blank"
      rel="noopener noreferrer"
      color="inherit"
      underline="none"
      title={t('common.owlto-bridge')}
    >
      <Button className={styles.actionButton} variant="primary" title={t('common.owlto-bridge')}>
        {t('common.swap-bridge')}
      </Button>
    </Link>
  );
};
