import { useAtom } from 'jotai';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import { approveMarginToken } from 'blockchain-api/approveMarginToken';
import { getSigner } from 'blockchain-api/getSigner';
import { postOrder } from 'blockchain-api/postOrder';
import { signMessage } from 'blockchain-api/signMessage';
import { Dialog } from 'components/dialog/Dialog';
import { SidesRow } from 'components/sides-row/SidesRow';
import { orderDigest } from 'network/network';
import { orderInfoAtom } from 'store/order-block.store';
import { proxyAddrAtom, selectedPoolAtom } from 'store/pools.store';
import { OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from 'types/enums';
import { OrderI } from 'types/types';

import styles from './ActionBlock.module.scss';

const orderBlockMap: Record<OrderBlockE, string> = {
  [OrderBlockE.Long]: 'Buy',
  [OrderBlockE.Short]: 'Sell',
};

export const ActionBlock = memo(() => {
  const { address } = useAccount();

  const [orderInfo] = useAtom(orderInfoAtom);
  const [proxyAddr] = useAtom(proxyAddrAtom);
  const [selectedPool] = useAtom(selectedPoolAtom);

  const [showReviewOrderModal, setShowReviewOrderModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const requestSentRef = useRef(false);

  const openReviewOrderModal = useCallback(() => setShowReviewOrderModal(true), []);

  const closeReviewOrderModal = useCallback(() => {
    setShowReviewOrderModal(false);
  }, []);

  const isBuySellButtonActive = useMemo(() => {
    if (!orderInfo || !address) {
      return false;
    }
    if (!orderInfo.size) {
      return false;
    }
    if (orderInfo.orderType === OrderTypeE.Limit && (orderInfo.limitPrice === null || orderInfo.limitPrice < 0)) {
      return false;
    }
    return !(orderInfo.orderType === OrderTypeE.Stop && (!orderInfo.triggerPrice || orderInfo.triggerPrice < 0));
  }, [orderInfo, address]);

  const handleOrderConfirm = useCallback(() => {
    if (requestSentRef.current || requestSent) {
      return;
    }

    if (!isBuySellButtonActive) {
      return;
    }

    if (!address || !orderInfo || !selectedPool) {
      return;
    }

    let orderType = orderInfo.orderType.toUpperCase();
    if (orderInfo.orderType === OrderTypeE.Stop) {
      orderType = orderInfo.limitPrice !== null && orderInfo.limitPrice > -1 ? 'STOP_LIMIT' : 'STOP_MARKET';
    }

    let limitPrice = orderInfo.limitPrice;
    if (orderInfo.orderType === OrderTypeE.Market) {
      limitPrice = orderInfo.maxEntryPrice;
    }

    const orders: OrderI[] = [];
    orders.push({
      symbol: orderInfo.symbol,
      side: orderInfo.orderBlock === OrderBlockE.Long ? 'BUY' : 'SELL',
      type: orderType,
      limitPrice: limitPrice !== null && limitPrice > -1 ? limitPrice : undefined,
      stopPrice: orderInfo.triggerPrice !== null ? orderInfo.triggerPrice : undefined,
      quantity: orderInfo.size,
      leverage: orderInfo.leverage,
      reduceOnly: orderInfo.reduceOnly !== null ? orderInfo.reduceOnly : undefined,
      keepPositionLvg: orderInfo.keepPositionLeverage,
      timestamp: Math.floor(Date.now() / 1000),
      // TODO: calculate based on expire for LIMIT and STOP
      deadline: Math.floor(Date.now() / 1000 + 8 * 60 * 60), // order expires 8 hours from now
    });

    if (orderInfo.stopLoss !== StopLossE.None && orderInfo.stopLossPrice) {
      orders.push({
        // Changed values comparing to main Order
        side: orderInfo.orderBlock === OrderBlockE.Long ? 'SELL' : 'BUY',
        type: 'STOP_MARKET',
        stopPrice: orderInfo.stopLossPrice,

        // Same as for main Order
        symbol: orderInfo.symbol,
        quantity: orderInfo.size,
        leverage: orderInfo.leverage,
        reduceOnly: orderInfo.reduceOnly !== null ? orderInfo.reduceOnly : undefined,
        keepPositionLvg: orderInfo.keepPositionLeverage,
        timestamp: Math.floor(Date.now() / 1000),
      });
    }

    if (orderInfo.takeProfit !== TakeProfitE.None && orderInfo.takeProfitPrice) {
      orders.push({
        // Changed values comparing to main Order
        side: orderInfo.orderBlock === OrderBlockE.Long ? 'SELL' : 'BUY',
        type: OrderTypeE.Limit.toUpperCase(),
        limitPrice: orderInfo.takeProfitPrice,

        // Same as for main Order
        symbol: orderInfo.symbol,
        quantity: orderInfo.size,
        leverage: orderInfo.leverage,
        reduceOnly: orderInfo.reduceOnly !== null ? orderInfo.reduceOnly : undefined,
        keepPositionLvg: orderInfo.keepPositionLeverage,
        timestamp: Math.floor(Date.now() / 1000),
      });
    }

    setRequestSent(true);
    requestSentRef.current = true;
    orderDigest(orders, address)
      .then((data) => {
        if (data.data.digests.length > 0) {
          const signer = getSigner();
          signMessage(signer, data.data.digests).then((signatures) => {
            approveMarginToken(signer, selectedPool.marginTokenAddr, proxyAddr).then(() => {
              postOrder(signer, signatures, data.data).then(() => {
                setShowReviewOrderModal(false);
              });
            });
          });
        }
      })
      .finally(() => {
        requestSentRef.current = false;
        setRequestSent(false);
      });
  }, [orderInfo, selectedPool, address, proxyAddr, requestSent, isBuySellButtonActive]);

  return (
    <Box className={styles.root}>
      <Button
        variant="action"
        disabled={!isBuySellButtonActive}
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
                {orderInfo.size} {orderInfo.baseCurrency} @ {orderInfo.midPrice.toFixed(2)} {orderInfo.quoteCurrency}
              </Typography>
            </Box>
            <Box className={styles.orderDetails}>
              <SidesRow leftSide="Trading fee:" rightSide={`${orderInfo.tradingFee} ${orderInfo.poolName}`} />
              <SidesRow leftSide="Collateral:" rightSide={`${orderInfo.collateral} ${orderInfo.poolName}`} />
              {orderInfo.maxEntryPrice !== null && (
                <SidesRow
                  leftSide="Max entry price:"
                  rightSide={`${orderInfo.maxEntryPrice.toFixed(2)} ${orderInfo.quoteCurrency}`}
                />
              )}
              {orderInfo.triggerPrice !== null && (
                <SidesRow
                  leftSide="Trigger price:"
                  rightSide={`${orderInfo.triggerPrice.toFixed(2)} ${orderInfo.quoteCurrency}`}
                />
              )}
              {orderInfo.limitPrice !== null && (
                <SidesRow
                  leftSide="Limit price:"
                  rightSide={
                    orderInfo.limitPrice > -1 ? `${orderInfo.limitPrice.toFixed(2)} ${orderInfo.quoteCurrency}` : '-'
                  }
                />
              )}
              <SidesRow
                leftSide="Stop-loss:"
                rightSide={orderInfo.stopLoss === StopLossE.None ? '-' : orderInfo.stopLoss}
              />
              <SidesRow
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
              <SidesRow leftSide="Position size:" rightSide={`+${orderInfo.size} ${orderInfo.baseCurrency}`} />
              <SidesRow leftSide="Margin:" rightSide={`${orderInfo.collateral} ${orderInfo.poolName}`} />
              <SidesRow leftSide="Leverage:" rightSide={`${orderInfo.leverage.toFixed(2)}x`} />
              <SidesRow leftSide="Liquidation price:" rightSide={`??? ${orderInfo.quoteCurrency}`} />
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
