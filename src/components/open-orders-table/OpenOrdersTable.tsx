import { useAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useState } from 'react';

import {
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  DialogTitle,
  Button,
  DialogActions,
  DialogContent,
  Box,
  TablePagination,
} from '@mui/material';

import { cancelOrder } from 'blockchain-api/contract-interactions/cancelOrder';
import { getSigner } from 'blockchain-api/getSigner';
import { signMessage } from 'blockchain-api/signMessage';
import { Dialog } from 'components/dialog/Dialog';
import { EmptyTableRow } from 'components/empty-table-row/EmptyTableRow';
import { getCancelOrder } from 'network/network';
import { openOrdersAtom } from 'store/pools.store';
import { AlignE } from 'types/enums';
import { OrderWithIdI, TableHeaderI } from 'types/types';

import { OpenOrderRow } from './elements/OpenOrderRow';

import styles from './OpenOrdersTable.module.scss';

const openOrdersHeaders: TableHeaderI[] = [
  { label: 'Symbol', align: AlignE.Left },
  { label: 'Side', align: AlignE.Left },
  { label: 'Type', align: AlignE.Left },
  { label: 'Position Size', align: AlignE.Right },
  { label: 'Limit Price', align: AlignE.Right },
  { label: 'Stop Price', align: AlignE.Right },
  { label: 'Leverage', align: AlignE.Right },
  { label: 'Good until', align: AlignE.Left },
  { label: '', align: AlignE.Center },
];

export const OpenOrdersTable = memo(() => {
  const [openOrders] = useAtom(openOrdersAtom);

  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithIdI | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOrderCancel = useCallback((order: OrderWithIdI) => {
    setCancelModalOpen(true);
    setSelectedOrder(order);
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleCancelOrderConfirm = useCallback(() => {
    if (!selectedOrder) {
      return;
    }

    if (requestSent) {
      return;
    }

    setRequestSent(true);
    getCancelOrder(selectedOrder.symbol, selectedOrder.id)
      .then((data) => {
        if (data.data.digest) {
          const signer = getSigner();
          signMessage(signer, [data.data.digest])
            .then((signatures) => {
              cancelOrder(signer, signatures[0], data.data, selectedOrder.id)
                .then(() => {
                  setCancelModalOpen(false);
                  setSelectedOrder(null);
                  setRequestSent(false);
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((error: any) => {
                  console.error(error);
                  setRequestSent(false);
                });
            })
            .catch((error) => {
              console.error(error);
              setRequestSent(false);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        setRequestSent(false);
      });
  }, [selectedOrder, requestSent]);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }, []);

  return (
    <>
      <TableContainer className={styles.root}>
        <MuiTable>
          <TableHead className={styles.tableHead}>
            <TableRow>
              {openOrdersHeaders.map((header) => (
                <TableCell key={header.label} align={header.align}>
                  <Typography variant="bodySmall">{header.label}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className={styles.tableBody}>
            {openOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
              <OpenOrderRow key={order.id} order={order} handleOrderCancel={handleOrderCancel} />
            ))}
            {openOrders.length === 0 && <EmptyTableRow colSpan={openOrdersHeaders.length} text="No open orders" />}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {openOrders.length > 5 && (
        <Box className={styles.paginationHolder}>
          <TablePagination
            align="center"
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={openOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
      <Dialog open={isCancelModalOpen}>
        <DialogTitle>Cancel Open Order</DialogTitle>
        <DialogContent>Are you sure you want to cancel this order?</DialogContent>
        <DialogActions>
          <Button onClick={closeCancelModal} variant="secondaryAction">
            Cancel
          </Button>
          <Button onClick={handleCancelOrderConfirm} variant="action">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
