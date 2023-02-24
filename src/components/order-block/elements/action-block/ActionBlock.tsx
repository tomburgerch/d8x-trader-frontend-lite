import { useAtom } from 'jotai';
import { memo, useCallback, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import { orderDigest } from 'network/network';
import { orderInfoAtom } from 'store/order-block.store';
import { OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from 'types/enums';

import styles from './ActionBlock.module.scss';
import { Row } from './elements/row/Row';
import { OrderI } from '../../../../types/types';

const orderBlockMap: Record<OrderBlockE, string> = {
  [OrderBlockE.Long]: 'Buy',
  [OrderBlockE.Short]: 'Sell',
};

export const ActionBlock = memo(() => {
  const { address } = useAccount();

  const [orderInfo] = useAtom(orderInfoAtom);

  const [showReviewOrderModal, setShowReviewOrderModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const requestSentRef = useRef(false);

  const openReviewOrderModal = useCallback(() => setShowReviewOrderModal(true), []);

  const closeReviewOrderModal = useCallback(() => {
    setShowReviewOrderModal(false);
  }, []);

  const handleOrderConfirm = useCallback(() => {
    if (requestSentRef.current || requestSent) {
      return;
    }

    if (!address || !orderInfo || !orderInfo.size) {
      return;
    }

    const order: OrderI = {
      symbol: orderInfo.symbol,
      side: orderInfo.orderBlock === OrderBlockE.Long ? 'BUY' : 'SELL',
      type: orderInfo.orderType.toUpperCase(),
      limitPrice: orderInfo.limitPrice != null ? orderInfo.limitPrice : undefined,
      quantity: orderInfo.size,
      leverage: orderInfo.leverage,
      timestamp: Math.floor(Date.now() / 1000),
      // TODO: calculate based on expire for LIMIT and STOP
      deadline: Math.floor(Date.now() / 1000 + 8 * 60 * 60), // order expires 8 hours from now
    };

    setRequestSent(true);
    requestSentRef.current = true;
    orderDigest(order, address)
      .then((data) => {
        // TODO: finalize data, sent for sign to MetaMask
        console.log(data);
      })
      .finally(() => {
        requestSentRef.current = false;
        setRequestSent(false);
      });
  }, [orderInfo, address, requestSent]);

  return (
    <Box className={styles.root}>
      <Button
        variant="action"
        disabled={!orderInfo || !orderInfo.size || !address}
        onClick={openReviewOrderModal}
        className={styles.buyButton}
      >
        {orderBlockMap[orderInfo?.orderBlock ?? OrderBlockE.Long]}{' '}
        {(orderInfo?.orderType ?? OrderTypeE.Market).toLowerCase()}
      </Button>
      {orderInfo && (
        <Dialog open={showReviewOrderModal} className={styles.dialog}>
          <DialogTitle>Review order</DialogTitle>
          <DialogContent>
            <Box>
              <Typography variant="bodyMedium" className={styles.centered}>
                {orderInfo.leverage.toFixed(2)}x {orderInfo.orderType} {orderBlockMap[orderInfo.orderBlock]}
              </Typography>
              <Typography variant="bodySmall" className={styles.centered}>
                {orderInfo.size} {orderInfo.baseCurrency} @ {orderInfo.price.toFixed(2)} {orderInfo.quoteCurrency}
              </Typography>
            </Box>
            <Box className={styles.orderDetails}>
              <Row leftSide="Trading fee:" rightSide={`${orderInfo.tradingFee} ${orderInfo.poolName}`} />
              <Row leftSide="Collateral:" rightSide={`${orderInfo.collateral} ${orderInfo.poolName}`} />
              {orderInfo.maxEntryPrice !== undefined && (
                <Row
                  leftSide="Max entry price:"
                  rightSide={`${orderInfo.maxEntryPrice.toFixed(2)} ${orderInfo.quoteCurrency}`}
                />
              )}
              {orderInfo.triggerPrice !== undefined && (
                <Row
                  leftSide="Trigger price:"
                  rightSide={`${orderInfo.triggerPrice.toFixed(2)} ${orderInfo.quoteCurrency}`}
                />
              )}
              {orderInfo.limitPrice !== undefined && (
                <Row
                  leftSide="Limit price:"
                  rightSide={
                    orderInfo.limitPrice ? `${orderInfo.limitPrice.toFixed(2)} ${orderInfo.quoteCurrency}` : '-'
                  }
                />
              )}
              <Row leftSide="Stop-loss:" rightSide={orderInfo.stopLoss === StopLossE.None ? '-' : orderInfo.stopLoss} />
              <Row
                leftSide="Take-profit:"
                rightSide={orderInfo.takeProfit === TakeProfitE.None ? '-' : orderInfo.takeProfit}
              />
            </Box>
            <Box className={styles.newPositionHeader}>
              <Typography variant="bodyMedium" className={styles.centered}>
                New position details
              </Typography>
            </Box>
            <Box className={styles.newPositionDetails}>
              <Row leftSide="Position size:" rightSide={`+${orderInfo.size} ${orderInfo.baseCurrency}`} />
              <Row leftSide="Margin:" rightSide={`${orderInfo.collateral} ${orderInfo.poolName}`} />
              <Row leftSide="Leverage:" rightSide={`${orderInfo.leverage.toFixed(2)}x`} />
              <Row leftSide="Liquidation price:" rightSide={`??? ${orderInfo.quoteCurrency}`} />
            </Box>
            <Box className={styles.validityMessages}>
              <Typography variant="bodyMedium" className={styles.centered}>
                Validity checks
              </Typography>
            </Box>
            <Box className={styles.goMessage}>
              <Typography variant="bodyMedium" className={styles.centered}>
                Good to go
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeReviewOrderModal} variant="secondaryAction">
              Cancel
            </Button>
            <Button onClick={handleOrderConfirm} variant="action">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
});
