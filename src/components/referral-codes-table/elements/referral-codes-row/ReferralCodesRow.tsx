import { useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import classnames from 'classnames';

import { Button, TableCell, TableRow, Typography } from '@mui/material';

import { AgencyReferrerDialog } from 'pages/refer-page/components/agency-referrer-dialog/AgencyReferrerDialog';
import { NormalReferrerDialog } from 'pages/refer-page/components/normal-referrer-dialog/NormalReferrerDialog';

import { useDialog } from 'hooks/useDialog';
import { ReferrerRoleE, useRebateRate } from 'pages/refer-page/hooks';

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

  const { address } = useAccount();
  const chainId = useChainId();

  const baseRebate = useRebateRate(chainId, address, isAgency ? ReferrerRoleE.AGENCY : ReferrerRoleE.NORMAL);

  const absolutePercentages = useMemo(
    () => ({
      referrerRebatePerc: (data.referrerRebatePerc * baseRebate) / 100,
      traderRebatePerc: (data.traderRebatePerc * baseRebate) / 100,
      agencyRebatePerc: (data.agencyRebatePerc * baseRebate) / 100,
    }),
    [baseRebate, data.agencyRebatePerc, data.referrerRebatePerc, data.traderRebatePerc]
  );

  return (
    <>
      <TableRow className={styles.root}>
        <TableCell className={classnames(styles.bodyCell, styles.codeCell)}>{data.code}</TableCell>
        <TableCell align="right" className={styles.bodyCell}>
          {formatToCurrency(absolutePercentages.referrerRebatePerc, '%', false, 2).replace(' ', '')}
        </TableCell>
        <TableCell align="right" className={styles.bodyCell}>
          {formatToCurrency(absolutePercentages.traderRebatePerc, '%', false, 2).replace(' ', '')}
        </TableCell>
        {isAgency && (
          <TableCell align="right" className={styles.bodyCell}>
            {formatToCurrency(absolutePercentages.agencyRebatePerc, '%', false, 2).replace(' ', '')}
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
          referrerRebatePercent={absolutePercentages.referrerRebatePerc}
          traderRebatePercent={absolutePercentages.traderRebatePerc}
          agencyRebatePercent={absolutePercentages.agencyRebatePerc}
        />
      )}
      {dialogOpen && !isAgency && (
        <NormalReferrerDialog
          code={data.code}
          type={ReferralDialogActionE.MODIFY}
          onClose={closeDialog}
          referrerRebatePercent={absolutePercentages.referrerRebatePerc}
          traderRebatePercent={absolutePercentages.traderRebatePerc}
        />
      )}
    </>
  );
};
