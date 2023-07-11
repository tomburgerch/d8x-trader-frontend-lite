import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import { AlignE } from 'types/enums';
import { type TableHeaderI } from 'types/types';

import { ReferralCodesRow } from './elements/referral-codes-row/ReferralCodesRow';

import styles from './ReferralCodesTable.module.scss';

export const ReferralCodesTable = () => {
  const referralCodesHeaders: TableHeaderI[] = [
    { label: 'Your code', align: AlignE.Left },
    { label: 'Referrer rebate rate', align: AlignE.Right },
    { label: 'Trader rebate rate', align: AlignE.Right },
    { label: 'Modify', align: AlignE.Center },
  ];

  const mockData = [
    { code: 'mycode1', refRebateRate: '1%', traderRebateRate: '2%' },
    { code: 'mycodTT', refRebateRate: '1%', traderRebateRate: '2%' },
    { code: 'mycodeTZ', refRebateRate: '1%', traderRebateRate: '2%' },
    { code: 'mycode23', refRebateRate: '1%', traderRebateRate: '2%' },
  ];

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {referralCodesHeaders.map(({ label, align }) => (
              <TableCell key={label.toString()} align={align}>
                <Typography variant="bodyTiny" className={styles.headerLabel}>
                  {label}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {mockData.map((data) => (
            <ReferralCodesRow key={data.code} data={data} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
