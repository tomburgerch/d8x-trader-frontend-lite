import classnames from 'classnames';

import { Button, TableCell, TableRow, Typography } from '@mui/material';

import { useDialog } from 'hooks/useDialog';
import { AgencyReferrerModifyDialog } from 'pages/refer-page/components/agency-referrer-modify-dialog/AgencyReferrerModifyDialog';
import { NormalReferrerModifyDialog } from 'pages/refer-page/components/normal-referrer-modify-dialog/NormalReferrerModifyDialog';
import type { ReferrerDataI } from 'types/types';
import { formatToCurrency } from 'utils/formatToCurrency';

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
      {dialogOpen && isAgency && <AgencyReferrerModifyDialog onClose={closeDialog} data={data} />}
      {dialogOpen && !isAgency && <NormalReferrerModifyDialog onClose={closeDialog} data={data} />}
    </>
  );
};
