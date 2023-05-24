import { useAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useAccount, useChainId } from 'wagmi';

import {
  Box,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

import { ReactComponent as RefreshIcon } from 'assets/icons/refreshIcon.svg';
import { EmptyTableRow } from 'components/empty-table-row/EmptyTableRow';
import { getFundingRatePayments } from 'network/history';
import { fundingListAtom, perpetualsAtom, positionsAtom } from 'store/pools.store';
import { AlignE } from 'types/enums';
import type { TableHeaderI } from 'types/types';

import { FundingBlock } from './elements/funding-block/FundingBlock';
import { FundingRow } from './elements/FundingRow';

import styles from './FundingTable.module.scss';

export const FundingTable = memo(() => {
  const [fundingList, setFundingList] = useAtom(fundingListAtom);
  const [perpetuals] = useAtom(perpetualsAtom);
  const [positions] = useAtom(positionsAtom);

  const updateTradesHistoryRef = useRef(false);

  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { width, ref } = useResizeDetector();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const refreshFundingList = useCallback(() => {
    if (updateTradesHistoryRef.current || !address || !isConnected) {
      return;
    }

    updateTradesHistoryRef.current = true;
    getFundingRatePayments(chainId, address)
      .then((data) => {
        setFundingList(data);
      })
      .finally(() => {
        updateTradesHistoryRef.current = false;
      });
  }, [chainId, address, isConnected, setFundingList]);

  useEffect(() => {
    refreshFundingList();
  }, [positions, refreshFundingList]); // "positions" change should affect refresh for Funding table

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }, []);

  const fundingListHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: 'Time', align: AlignE.Left },
      { label: 'Perpetual', align: AlignE.Left },
      { label: 'Funding Payment', align: AlignE.Right },
      { label: <RefreshIcon onClick={refreshFundingList} className={styles.actionIcon} />, align: AlignE.Center },
    ],
    [refreshFundingList]
  );

  return (
    <div className={styles.root} ref={ref}>
      {width && width >= 600 && (
        <TableContainer className={styles.root}>
          <MuiTable>
            <TableHead className={styles.tableHead}>
              <TableRow>
                {fundingListHeaders.map((header) => (
                  <TableCell key={header.label.toString()} align={header.align}>
                    <Typography variant="bodySmall">{header.label}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody className={styles.tableBody}>
              {address &&
                fundingList
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((funding) => (
                    <FundingRow
                      key={`${funding.perpetualId}-${funding.timestamp}`}
                      headers={fundingListHeaders}
                      perpetuals={perpetuals}
                      funding={funding}
                    />
                  ))}
              {(!address || fundingList.length === 0) && (
                <EmptyTableRow
                  colSpan={fundingListHeaders.length}
                  text={!address ? 'Please connect your wallet' : 'No funding data'}
                />
              )}
            </TableBody>
          </MuiTable>
        </TableContainer>
      )}
      {(!width || width < 600) && (
        <Box>
          <Box className={styles.refreshHolder}>
            <RefreshIcon onClick={refreshFundingList} className={styles.actionIcon} />
          </Box>
          <Box>
            {address &&
              fundingList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((funding) => (
                  <FundingBlock
                    key={`${funding.perpetualId}-${funding.timestamp}`}
                    headers={fundingListHeaders}
                    perpetuals={perpetuals}
                    funding={funding}
                  />
                ))}
            {(!address || fundingList.length === 0) && (
              <Box className={styles.noData}>{!address ? 'Please connect your wallet' : 'No funding data'}</Box>
            )}
          </Box>
        </Box>
      )}
      {address && fundingList.length > 5 && (
        <Box className={styles.paginationHolder}>
          <TablePagination
            align="center"
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={fundingList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
    </div>
  );
});
