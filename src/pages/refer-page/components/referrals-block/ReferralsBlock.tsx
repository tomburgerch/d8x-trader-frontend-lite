import { useAtom } from 'jotai';
import { useAccount } from 'wagmi';

import { Box, Button, Typography } from '@mui/material';

import { Separator } from 'components/separator/Separator';
import { ReferralCodesTable } from 'components/referral-codes-table/ReferralCodesTable';
import { WalletConnectButton } from 'components/wallet-connect-button/WalletConnectButton';
import { useDialog } from 'hooks/useDialog';
import { isAgencyAtom, referralCodeAtom } from 'store/refer.store';

import { NormalReferrerCreateDialog } from '../normal-referrer-create-dialog/NormalReferrerCreateDialog';
import { AgencyReferrerCreateDialog } from '../agency-referrer-create-dialog/AgencyReferrerCreateDialog';

import styles from './ReferralsBlock.module.scss';

export const ReferralsBlock = () => {
  const [isAgency] = useAtom(isAgencyAtom);
  const [referralCode] = useAtom(referralCodeAtom);

  const { address } = useAccount();

  const { dialogOpen, openDialog, closeDialog } = useDialog();

  return (
    <Box className={styles.root}>
      <Box className={styles.buttonContainer}>
        {address ? (
          <Button onClick={openDialog} variant="primary" className={styles.enterCodeButton}>
            Enter code
          </Button>
        ) : (
          <WalletConnectButton />
        )}
      </Box>
      <Separator className={styles.divider} />
      {address && referralCode ? (
        <ReferralCodesTable isAgency={isAgency} codes={isAgency ? referralCode.agency : referralCode.referrer} />
      ) : (
        <>
          <Typography variant="bodySmall" component="p" className={styles.dataTitle}>
            Your codes
          </Typography>
          <Typography variant="bodyLarge" className={styles.dataValue}>
            N/A
          </Typography>
        </>
      )}
      {dialogOpen && !isAgency && <NormalReferrerCreateDialog onClose={closeDialog} />}
      {dialogOpen && isAgency && <AgencyReferrerCreateDialog onClose={closeDialog} />}
    </Box>
  );
};
