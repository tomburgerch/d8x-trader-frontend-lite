import { useAtom } from 'jotai';
import { useState } from 'react';

import { Button } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import { showWelcomeModalAtom } from 'store/app.store';

import styles from './WelcomeModal.module.scss';
import { config } from 'config';

export const WelcomeModal = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useAtom(showWelcomeModalAtom);

  const [showModal, setShowModal] = useState(showWelcomeModal);

  const handleModalClose = () => {
    setShowWelcomeModal(false);
    setShowModal(false);
  };

  return (
    <Dialog
      open={config.showChallengeModal && showModal}
      className={styles.dialog}
      dialogTitle="Disclaimer"
      dialogContentClassName={styles.dialogContent}
      footerActions={
        <Button onClick={handleModalClose} variant="secondary" size="small">
          Agree
        </Button>
      }
    >
      <p>
        ALL FUNCTIONALITIES OF THE D8X PROTOCOL SOFTWARE ARE OF A PURELY TECHNICAL NATURE, ARE NOT ASSOCIATED WITH, AND
        DO NOT CONVEY ANY LEGAL CLAIM TOWARD ANY ENTITY, INDIVIDUAL, OR GROUP OF INDIVIDUALS, CONTRIBUTORS, D8X TOKEN
        HOLDERS OR ANY OTHER THIRD-PARTY.
      </p>
      <p>
        The User understands and acknowledges that D8X Protocol Software, in particular, and smart contracts,
        blockchains, cryptographic tokens, and related systems and software, in general, are nascent, experimental,
        inherently risky, and subject to change. In order to understand the risks associated with using the D8X Protocol
        Software, as well as any other blockchain-based technology, users are strongly encouraged to get acquainted with
        the underlying protocols as much as possible: DO YOUR OWN RESEARCH.
      </p>
      <p>
        By accessing or using the Frontend, you represent and warrant that you do not reside in, are not located in, are
        not a citizen of, are not incorporated in, do not have registered office in, or are not in any other way subject
        to the jurisdiction of a Prohibited Jurisdiction including, but not limited to, the UNITED STATES OF AMERICA,
        BELARUS, BURUNDI, BURMA (MYANMAR), CENTRAL AFRICAN REPUBLIC, CONGO, DEMOCRATIC REP., DEMOCRATIC PEOPLES REPUBLIC
        OF KOREA (DPRK), GUINEA, GUINEA BISSAU, HAITI, IRAN, IRAQ, YEMEN, LEBANON, LIBYA, MALI, NICARAGUA, SOMALIA,
        SUDAN, REPUBLIC OF SOUTH SUDAN, SYRIA, VENEZUELA, AND ZIMBABWE.
      </p>
      <p>
        IF YOU DO NOT AGREE TO THESE TERMS WITHOUT LIMITATION OR EXCLUSION OR TO ANY CHANGES TO THESE TERMS, YOU MUST
        IMMEDIATELY EXIT THE WEBSITE AND STOP ACCESSING OR USING THE SERVICES.
      </p>
    </Dialog>
  );
};
