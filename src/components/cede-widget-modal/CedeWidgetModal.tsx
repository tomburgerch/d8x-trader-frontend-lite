import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { Button } from '@mui/material';

import { CedeWidget } from 'components/cede-widget-modal/cede-widget/CedeWidget';
import { Dialog } from 'components/dialog/Dialog';
import { cedeModalOpenAtom } from 'store/global-modals.store';

import styles from './CedeWidgetModal.module.scss';

export const CedeWidgetModal = () => {
  const { t } = useTranslation();

  const { isConnected } = useAccount();

  const [isOpen, setOpen] = useAtom(cedeModalOpenAtom);

  if (!isConnected) {
    return null;
  }

  const onClose = () => setOpen(false);

  return (
    <Dialog open={isOpen} onCloseClick={onClose}>
      <div className={styles.dialogContent}>
        {isOpen && <CedeWidget />}
        <div className={styles.buttonsBlock}>
          <Button variant="secondary" className={styles.closeButton} onClick={onClose}>
            {t('common.info-modal.close')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
