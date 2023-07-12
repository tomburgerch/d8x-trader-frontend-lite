import { useAccount } from 'wagmi';

import { Box, Button, Typography } from '@mui/material';

import { WalletConnectButton } from 'components/wallet-connect-button/WalletConnectButton';
import { ReferralCodesTable } from 'components/referral-codes-table/ReferralCodesTable';
import { NormalReferrerCreateDialog } from '../normal-referrer-create-dialog/NormalReferrerCreateDialog';
import { AgencyReferrerCreateDialog } from '../agency-referrer-create-dialog/AgencyReferrerCreateDialog';

import { useDialog } from 'hooks/useDialog';

import styles from './ReferralsBlock.module.scss';
import { Separator } from '../../../../components/separator/Separator';

enum ReferrerTypeE {
  Normal,
  Agency,
}

export const ReferralsBlock = () => {
  const { address } = useAccount();

  const { dialogOpen, openDialog, closeDialog } = useDialog();

  const referrerType: ReferrerTypeE = ReferrerTypeE.Agency;

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
      {address ? (
        <ReferralCodesTable />
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
      {dialogOpen && (referrerType as ReferrerTypeE) === ReferrerTypeE.Normal && (
        <NormalReferrerCreateDialog onClose={closeDialog} />
      )}
      {dialogOpen && (referrerType as ReferrerTypeE) === ReferrerTypeE.Agency && (
        <AgencyReferrerCreateDialog onClose={closeDialog} />
      )}
    </Box>
  );
};
