import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { Dialog } from 'components/dialog/Dialog';
import { LiFiWidgetHolder } from 'components/li-fi-widget-modal/li-fi-widget/LiFiWidgetHolder';
import { lifiModalOpenAtom } from 'store/global-modals.store';

import styles from './LiFiWidgetModal.module.scss';

export const LiFiWidgetModal = () => {
  const { t } = useTranslation();

  const { isConnected } = useAccount();

  const [isOpen, setOpen] = useAtom(lifiModalOpenAtom);

  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  if (!isConnected) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onCloseClick={onClose}
      dialogTitle={t('common.swap-bridge')}
      dialogContentClassName={styles.dialogContent}
    >
      {isOpen && <LiFiWidgetHolder />}
    </Dialog>
  );
};
