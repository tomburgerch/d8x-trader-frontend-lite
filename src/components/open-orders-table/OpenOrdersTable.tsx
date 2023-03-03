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

import { cancelOrder } from 'blockchain-api/contract-interactions/cancelOrder';
import { getSigner } from 'blockchain-api/getSigner';
import { signMessage } from 'blockchain-api/signMessage';
import { Dialog } from 'components/dialog/Dialog';
import { EmptyTableRow } from 'components/empty-table-row/EmptyTableRow';
import { getCancelOrder } from 'network/network';
import { openOrdersAtom } from 'store/pools.store';
import { OrderWithIdI } from 'types/types';

import { OpenOrderRow } from './elements/OpenOrderRow';

import styles from './OpenOrdersTable.module.scss';

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
  const [selectedOrder, setSelectedOrder] = useState<OrderWithIdI | null>(null);
  const [requestSent, setRequestSent] = useState(false);

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
