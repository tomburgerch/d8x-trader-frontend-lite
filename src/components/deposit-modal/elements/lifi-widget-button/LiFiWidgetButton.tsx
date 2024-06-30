import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import { Button } from '@mui/material';

import { lifiModalOpenAtom } from 'store/global-modals.store';

import styles from '../../DepositModal.module.scss';

export const LiFiWidgetButton = () => {
  const { t } = useTranslation();

  const setModalOpen = useSetAtom(lifiModalOpenAtom);

  return (
    <Button
      onClick={() => setModalOpen(true)}
      className={styles.actionButton}
      variant="primary"
      title={t('common.li-fi-widget.button-title')}
    >
      {t('common.swap-bridge')}
    </Button>
  );
};
