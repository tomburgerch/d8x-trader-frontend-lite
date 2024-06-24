import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { Button } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import { LiFiWidgetHolder } from 'components/li-fi-widget-modal/li-fi-widget/LiFiWidgetHolder';
import { lifiModalOpenAtom } from 'store/global-modals.store';

import styles from './LiFiWidgetModal.module.scss';

export const LiFiWidgetModal = () => {
  const { t } = useTranslation();

  const { isConnected } = useAccount();

  const [isOpen, setOpen] = useAtom(lifiModalOpenAtom);

  if (!isConnected) {
    return null;
  }

  const onClose = () => setOpen(false);

  return (
    <Dialog open={isOpen} onCloseClick={onClose}>
      <div className={styles.dialogContent}>
        {isOpen && <LiFiWidgetHolder />}
        <div className={styles.buttonsBlock}>
          <Button variant="secondary" className={styles.closeButton} onClick={onClose}>
            {t('common.info-modal.close')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
