import classnames from 'classnames';

import { Button, TableCell, TableRow, Typography } from '@mui/material';

import { AgencyReferrerDialog } from 'pages/refer-page/components/agency-referrer-dialog/AgencyReferrerDialog';
import { NormalReferrerDialog } from 'pages/refer-page/components/normal-referrer-dialog/NormalReferrerDialog';

import { useDialog } from 'hooks/useDialog';

import { formatToCurrency } from 'utils/formatToCurrency';

import type { ReferrerDataI } from 'types/types';
import { ReferralDialogActionE } from 'types/enums';

import styles from './ReferralCodesRow.module.scss';

interface ReferralCodesRowPropsI {
  isAgency: boolean;
  data: ReferrerDataI;
}

export const ReferralCodesRow = ({ isAgency, data }: ReferralCodesRowPropsI) => {
  const { dialogOpen, openDialog, closeDialog } = useDialog();

  return (
    <>
      <TableRow className={styles.root}>
        <TableCell className={classnames(styles.bodyCell, styles.codeCell)}>{data.code}</TableCell>
        <TableCell align="right" className={styles.bodyCell}>
          {formatToCurrency(data.referrerRebatePerc, '%', false, 2)}
        </TableCell>
        <TableCell align="right" className={styles.bodyCell}>
          {formatToCurrency(data.traderRebatePerc, '%', false, 2)}
        </TableCell>
        {isAgency && (
          <TableCell align="right" className={styles.bodyCell}>
            {formatToCurrency(data.agencyRebatePerc, '%', false, 2)}
          </TableCell>
        )}
        <TableCell align="center" className={classnames(styles.bodyCell, styles.modifyCell)}>
          <Button variant="primary" onClick={openDialog} className={styles.modifyButton}>
            <Typography variant="bodyTiny">Modify</Typography>
          </Button>
        </TableCell>
      </TableRow>
      {dialogOpen && isAgency && (
        <AgencyReferrerDialog
          code={data.code}
          referrerAddr={data.referrerAddr}
          type={ReferralDialogActionE.MODIFY}
          onClose={closeDialog}
        />
      )}
      {dialogOpen && !isAgency && (
        <NormalReferrerDialog code={data.code} type={ReferralDialogActionE.MODIFY} onClose={closeDialog} />
      )}
    </>
  );
};
