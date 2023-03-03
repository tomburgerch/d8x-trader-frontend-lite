import { useAtom } from 'jotai';
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
} from '@mui/material';

import { openOrdersAtom } from 'store/pools.store';

import { OpenOrderRow } from './elements/OpenOrderRow';

import styles from './OpenOrdersTable.module.scss';
import { EmptyTableRow } from '../empty-table-row/EmptyTableRow';
import { Dialog } from '../dialog/Dialog';

const openOrdersHeaders = [
  'Symbol',
  'Side',
  'Type',
  'Position Size',
  'Limit Price',
  'Stop Price',
  'Leverage',
  'Good until',
  '',
];

export const OpenOrdersTable = memo(() => {
  const [openOrders] = useAtom(openOrdersAtom);

  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [, /*selectedOrderId*/ setSelectedOrderId] = useState('');

  const handleOrderCancel = useCallback((orderId: string) => {
    setCancelModalOpen(true);
    setSelectedOrderId(orderId);
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModalOpen(false);
    setSelectedOrderId('');
  }, []);

  const handleCancelOrderConfirm = useCallback(() => {
    // TODO: ...
    setCancelModalOpen(false);
    setSelectedOrderId('');
  }, []);

  return (
    <>
      <TableContainer className={styles.root}>
        <MuiTable>
          <TableHead className={styles.tableHead}>
            <TableRow>
              {openOrdersHeaders.map((header) => (
                <TableCell key={header} align="left">
                  <Typography variant="bodySmall">{header}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className={styles.tableBody}>
            {openOrders.map((order) => (
              <OpenOrderRow key={order.id} order={order} handleOrderCancel={handleOrderCancel} />
            ))}
            {openOrders.length === 0 && <EmptyTableRow colSpan={openOrdersHeaders.length} text="No open orders" />}
          </TableBody>
        </MuiTable>
      </TableContainer>
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
