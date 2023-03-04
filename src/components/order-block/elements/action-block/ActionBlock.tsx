import { useAtom } from 'jotai';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import { approveMarginToken } from 'blockchain-api/approveMarginToken';
import { postOrder } from 'blockchain-api/contract-interactions/postOrder';
import { getSigner } from 'blockchain-api/getSigner';
import { signMessage } from 'blockchain-api/signMessage';
import { Dialog } from 'components/dialog/Dialog';
import { SidesRow } from 'components/sides-row/SidesRow';
import { orderDigest, positionRiskOnTrade } from 'network/network';
import { orderInfoAtom } from 'store/order-block.store';
import { newPositionRiskAtom, proxyAddrAtom, selectedPoolAtom } from 'store/pools.store';
import { OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from 'types/enums';
import { OrderI, OrderInfoI } from 'types/types';
import { formatNumber } from 'utils/formatNumber';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './ActionBlock.module.scss';

const orderBlockMap: Record<OrderBlockE, string> = {
  [OrderBlockE.Long]: 'Buy',
  [OrderBlockE.Short]: 'Sell',
};

function createMainOrder(orderInfo: OrderInfoI) {
  let orderType = orderInfo.orderType.toUpperCase();
  if (orderInfo.orderType === OrderTypeE.Stop) {
    orderType = orderInfo.limitPrice !== null && orderInfo.limitPrice > -1 ? 'STOP_LIMIT' : 'STOP_MARKET';
  }

  let limitPrice = orderInfo.limitPrice;
  if (orderInfo.orderType === OrderTypeE.Market) {
    limitPrice = orderInfo.maxMinEntryPrice;
  }

  return {
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
  };
}

export const ActionBlock = memo(() => {
  const { address } = useAccount();

  const [orderInfo] = useAtom(orderInfoAtom);
  const [proxyAddr] = useAtom(proxyAddrAtom);
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [newPositionRisk, setNewPositionRisk] = useAtom(newPositionRiskAtom);

  const [showReviewOrderModal, setShowReviewOrderModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const requestSentRef = useRef(false);

  const openReviewOrderModal = useCallback(() => {
    if (!orderInfo || !address) {
      return;
    }

    setShowReviewOrderModal(true);
    setNewPositionRisk(null);

    const mainOrder = createMainOrder(orderInfo);
    positionRiskOnTrade(mainOrder, address).then((data) => {
      setNewPositionRisk(data.data.newPositionRisk);
    });
  }, [orderInfo, address, setNewPositionRisk]);

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

    if (!address || !orderInfo || !selectedPool || !proxyAddr) {
      return;
    }

    const orders: OrderI[] = [];
    orders.push(createMainOrder(orderInfo));

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
          signMessage(signer, data.data.digests)
            .then((signatures) => {
              approveMarginToken(signer, selectedPool.marginTokenAddr, proxyAddr)
                .then(() => {
                  postOrder(signer, signatures, data.data)
                    .then(() => {
                      setShowReviewOrderModal(false);
                      requestSentRef.current = false;
                      setRequestSent(false);
                    })
                    .catch((error) => {
                      console.error(error);
                      requestSentRef.current = false;
                      setRequestSent(false);
                    });
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((error: any) => {
                  console.error(error);
                  requestSentRef.current = false;
                  setRequestSent(false);
                });
            })
            .catch((error) => {
              console.error(error);
              requestSentRef.current = false;
              setRequestSent(false);
            });
        }
      })
      .catch((error) => {
        console.error(error);
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
                {formatNumber(orderInfo.leverage)}x {orderInfo.orderType} {orderBlockMap[orderInfo.orderBlock]}
              </Typography>
              <Typography variant="bodySmall" className={styles.centered}>
                {orderInfo.size} {orderInfo.baseCurrency} @{' '}
                {formatToCurrency(orderInfo.midPrice, orderInfo.quoteCurrency)}
              </Typography>
            </Box>
            <Box className={styles.orderDetails}>
              <SidesRow
                leftSide="Trading fee:"
                rightSide={formatToCurrency(orderInfo.tradingFee, orderInfo.poolName, 6)}
              />
              <SidesRow
                leftSide="Collateral:"
                rightSide={newPositionRisk ? formatToCurrency(orderInfo.collateral, orderInfo.poolName) : '-'}
              />
              {orderInfo.maxMinEntryPrice !== null && (
                <SidesRow
                  leftSide={`${orderInfo.orderBlock === OrderBlockE.Long ? 'Max' : 'Min'} entry price:`}
                  rightSide={formatToCurrency(orderInfo.maxMinEntryPrice, orderInfo.quoteCurrency)}
                />
              )}
              {orderInfo.triggerPrice !== null && (
                <SidesRow
                  leftSide="Trigger price:"
                  rightSide={formatToCurrency(orderInfo.triggerPrice, orderInfo.quoteCurrency)}
                />
              )}
              {orderInfo.limitPrice !== null && (
                <SidesRow
                  leftSide="Limit price:"
                  rightSide={
                    orderInfo.limitPrice > -1 ? formatToCurrency(orderInfo.limitPrice, orderInfo.quoteCurrency) : '-'
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
              <SidesRow
                leftSide="Position size:"
                rightSide={
                  newPositionRisk
                    ? formatToCurrency(newPositionRisk.positionNotionalBaseCCY + orderInfo.size, orderInfo.baseCurrency)
                    : '-'
                }
              />
              <SidesRow
                leftSide="Margin:"
                rightSide={newPositionRisk ? formatToCurrency(newPositionRisk.collateralCC, orderInfo.poolName) : '-'}
              />
              <SidesRow
                leftSide="Leverage:"
                rightSide={newPositionRisk ? `${formatNumber(newPositionRisk?.leverage)}x` : '-'}
              />
              <SidesRow
                leftSide="Liquidation price:"
                rightSide={
                  !newPositionRisk || newPositionRisk.liquidationPrice[0] <= 0
                    ? '-'
                    : formatToCurrency(newPositionRisk?.liquidationPrice[0] ?? 0, orderInfo.quoteCurrency)
                }
              />
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
