import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

import { AlignE } from 'types/enums';
import type { ReferrerDataI, TableHeaderI } from 'types/types';

import { EmptyTableRow } from '../empty-table-row/EmptyTableRow';
import { ReferralCodesRow } from './elements/referral-codes-row/ReferralCodesRow';

import styles from './ReferralCodesTable.module.scss';

interface ReferralCodesTablePropsI {
  isAgency: boolean;
  codes: ReferrerDataI[];
}

export const ReferralCodesTable = memo(({ isAgency, codes }: ReferralCodesTablePropsI) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const referralCodesHeaders: TableHeaderI[] = useMemo(() => {
    const headers = [
      { label: 'Your code', align: AlignE.Left },
      { label: 'Referrer rebate rate', align: AlignE.Right },
      { label: 'Trader rebate rate', align: AlignE.Right },
    ];
    if (isAgency) {
      headers.push({ label: 'Agency rebate rate', align: AlignE.Right });
    }
    headers.push({ label: 'Modify', align: AlignE.Center });
    return headers;
  }, [isAgency]);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }, []);

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
          {codes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data) => (
            <ReferralCodesRow key={data.code} data={data} isAgency={isAgency} />
          ))}
          {codes.length === 0 && <EmptyTableRow colSpan={referralCodesHeaders.length} text={'No rebate codes'} />}
        </TableBody>
      </Table>
      {codes.length > 5 && (
        <Box className={styles.paginationHolder}>
          <TablePagination
            align="center"
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={codes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
    </TableContainer>
  );
});
