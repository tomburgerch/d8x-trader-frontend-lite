import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { ReactComponent as InfoIcon } from 'assets/icons/infoIcon.svg';
import { Dialog } from 'components/dialog/Dialog';

import styles from './InfoBlock.module.scss';

interface InfoBlockPropsI {
  title: string | JSX.Element;
  content: string | JSX.Element;
  classname?: string;
}

export const InfoBlock = ({ title, content, classname }: InfoBlockPropsI) => {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <InfoIcon onClick={() => setModalOpen(true)} className={classNames(styles.actionIcon, classname)} /> {title}
      <Dialog open={isModalOpen} className={styles.dialog}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent className={styles.dialogContent}>{content}</DialogContent>
        <DialogActions className={styles.dialogAction}>
          <Button onClick={() => setModalOpen(false)} variant="secondary" size="small">
            {t('common.info-modal.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
