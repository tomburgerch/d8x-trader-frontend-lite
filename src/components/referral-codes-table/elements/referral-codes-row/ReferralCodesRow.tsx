import classnames from 'classnames';

import { Button, TableCell, TableRow, Typography } from '@mui/material';

import styles from './ReferralCodesRow.module.scss';

interface ReferralCodesRowDataI {
  code: string;
  refRebateRate: string;
  traderRebateRate: string;
}

interface ReferralCodesRowPropsI {
  data: ReferralCodesRowDataI;
}

export const ReferralCodesRow = ({ data }: ReferralCodesRowPropsI) => {
  return (
    <TableRow className={styles.root}>
      <TableCell className={classnames(styles.bodyCell, styles.codeCell)}>{data.code}</TableCell>
      <TableCell align="right" className={styles.bodyCell}>
        {data.refRebateRate}
      </TableCell>
      <TableCell align="right" className={styles.bodyCell}>
        {data.traderRebateRate}
      </TableCell>
      <TableCell align="center" className={classnames(styles.bodyCell, styles.modifyCell)}>
        <Button variant="primary" className={styles.modifyButton}>
          <Typography variant="bodyTiny">Modify</Typography>
        </Button>
      </TableCell>
    </TableRow>
  );
};
