import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { useAtom } from 'jotai';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useAccount, useSigner, useBalance, useContractEvent, useWaitForTransaction } from 'wagmi';
import { toast } from 'react-toastify';

import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import { approveMarginToken } from 'blockchain-api/approveMarginToken';
import { postOrder } from 'blockchain-api/contract-interactions/postOrder';
import { Dialog } from 'components/dialog/Dialog';
import { SidesRow } from 'components/sides-row/SidesRow';
import { ToastContent } from 'components/toast-content/ToastContent';
import { getMaxOrderSizeForTrader, orderDigest, positionRiskOnTrade } from 'network/network';
import { orderInfoAtom } from 'store/order-block.store';
import {
  collateralDepositAtom,
  newPositionRiskAtom,
  perpetualStaticInfoAtom,
  proxyAddrAtom,
  removeOpenOrderAtom,
  selectedPoolAtom,
  traderAPIAtom,
} from 'store/pools.store';
import { OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from 'types/enums';
import { MaxOrderSizeResponseI, OrderI, OrderInfoI } from 'types/types';
import { formatNumber } from 'utils/formatNumber';
import { formatToCurrency } from 'utils/formatToCurrency';
import { mapExpiryToNumber } from 'utils/mapExpiryToNumber';

import styles from './ActionBlock.module.scss';

const orderBlockMap: Record<OrderBlockE, string> = {
  [OrderBlockE.Long]: 'Buy',
  [OrderBlockE.Short]: 'Sell',
};

const SECONDARY_DEADLINE_MULTIPLIER = 24 * 1825;

function createMainOrder(orderInfo: OrderInfoI) {
  let orderType = orderInfo.orderType.toUpperCase();
  if (orderInfo.orderType === OrderTypeE.Stop) {
    orderType = orderInfo.limitPrice !== null && orderInfo.limitPrice > -1 ? 'STOP_LIMIT' : 'STOP_MARKET';
  }

  let limitPrice = orderInfo.limitPrice;
  if (orderInfo.orderType === OrderTypeE.Market) {
    limitPrice = orderInfo.maxMinEntryPrice;
  }

  let deadlineMultiplier = 8; // By default, is it set to 8 hours
  if (orderInfo.orderType !== OrderTypeE.Market && orderInfo.expireDays) {
    deadlineMultiplier = 24 * mapExpiryToNumber(orderInfo.expireDays);
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
    deadline: Math.floor(Date.now() / 1000 + 60 * 60 * deadlineMultiplier),
  };
}

export const ActionBlock = memo(() => {
  const { address } = useAccount();

  const { data: signer } = useSigner({
    onError(error) {
      console.log('Error', error);
    },
    onSuccess(data) {
      data?.getBalance().then((b: BigNumber) => console.log(`balance = ${b}`));
    },
  });

  const [orderInfo] = useAtom(orderInfoAtom);
  const [proxyAddr] = useAtom(proxyAddrAtom);
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [selectedPerpetualStaticInfo] = useAtom(perpetualStaticInfoAtom);
  const [newPositionRisk, setNewPositionRisk] = useAtom(newPositionRiskAtom);
  const [collateralDeposit, setCollateralDeposit] = useAtom(collateralDepositAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [, removeOpenOrder] = useAtom(removeOpenOrderAtom);

  const [showReviewOrderModal, setShowReviewOrderModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [maxOrderSize, setMaxOrderSize] = useState<MaxOrderSizeResponseI>();
  const [postOrderTransaction, setPostOrderTransaction] = useState<ContractTransaction | null>(null);
  const [isAwaitingExecution, setIsAwaitingExecution] = useState<boolean>(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | undefined>(undefined);

  const requestSentRef = useRef(false);

  const marginTokenBalance = useBalance({
    address: address,
    token: selectedPool?.marginTokenAddr as `0x${string}` | undefined,
    onSuccess(data) {
      console.log(`my ${selectedPool?.poolSymbol} balance is ${data.formatted} ${data.symbol}`);
    },
  });

  const openReviewOrderModal = useCallback(() => {
    if (!orderInfo || !address) {
      return;
    }

    setShowReviewOrderModal(true);
    setNewPositionRisk(null);

    const mainOrder = createMainOrder(orderInfo);
    positionRiskOnTrade(traderAPI, mainOrder, address).then((data) => {
      setNewPositionRisk(data.data.newPositionRisk);
      setCollateralDeposit(data.data.orderCost);
    });

    setMaxOrderSize(undefined);
    getMaxOrderSizeForTrader(traderAPI, mainOrder, address, Date.now()).then((data) => {
      setMaxOrderSize(data.data);
    });
  }, [orderInfo, address, traderAPI, setNewPositionRisk, setCollateralDeposit]);

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

  const parsedOrders = useMemo(() => {
    if (requestSentRef.current || requestSent) {
      return;
    }

    if (!isBuySellButtonActive) {
      return;
    }

    if (!signer || !address || !orderInfo || !selectedPool || !proxyAddr || !selectedPerpetualStaticInfo) {
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
        deadline: Math.floor(Date.now() / 1000 + 60 * 60 * SECONDARY_DEADLINE_MULTIPLIER),

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
        deadline: Math.floor(Date.now() / 1000 + 60 * 60 * SECONDARY_DEADLINE_MULTIPLIER),

        // Same as for main Order
        symbol: orderInfo.symbol,
        quantity: orderInfo.size,
        leverage: orderInfo.leverage,
        reduceOnly: orderInfo.reduceOnly !== null ? orderInfo.reduceOnly : undefined,
        keepPositionLvg: orderInfo.keepPositionLeverage,
        timestamp: Math.floor(Date.now() / 1000),
      });
    }
    return orders;
  }, [
    orderInfo,
    selectedPool,
    address,
    proxyAddr,
    requestSent,
    isBuySellButtonActive,
    selectedPerpetualStaticInfo,
    signer,
  ]);

  const waitForTxnConfig = useMemo(() => {
    if (!postOrderTransaction || !postOrderTransaction.hash) {
      console.log('not waiting for tx');
      return {
        confirmations: 1,
      };
    }
    return {
      hash: postOrderTransaction.hash as `0x${string}`,
      confirmations: 1,
      onSuccess(data: unknown) {
        console.log(data);
        toast.success(<ToastContent title="Order posted" bodyLines={[]} />);
        setPostOrderTransaction(null);
        setIsAwaitingExecution(true);
      },
    };
  }, [postOrderTransaction, setPostOrderTransaction, setIsAwaitingExecution]);

  useWaitForTransaction(waitForTxnConfig);

  const proxyABI = useMemo(() => {
    return traderAPI?.getABI('proxy') as string[] | undefined;
  }, [traderAPI]);

  const tradeEventConfig = useMemo(() => {
    if (!isAwaitingExecution || !traderAPI || !pendingOrderId) {
      // with this config the event listener is turned off
      return {
        listener(...args: unknown[]) {
          console.log(args);
        },
      };
    } else {
      // listen to the Trade event
      console.log('listening to trade event...');
      return {
        address: proxyAddr as `0x${string}`,
        abi: proxyABI,
        eventName: 'Trade',
        listener(...args: unknown[]) {
          console.log(`perp id: ${args[0]}, trader: ${args[1]}`);
          if (args[4] === pendingOrderId) {
            setIsAwaitingExecution(false);
            removeOpenOrder(pendingOrderId);
            const symbol = traderAPI.getSymbolFromPerpId(args[0] as number);
            if (symbol) {
              toast.success(<ToastContent title="Order executed" bodyLines={[{ label: 'Symbol', value: symbol }]} />);
            }
          }
        },
      };
    }
  }, [isAwaitingExecution, proxyAddr, proxyABI, pendingOrderId, traderAPI, removeOpenOrder]);

  useContractEvent(tradeEventConfig);

  const handleOrderConfirm = useCallback(() => {
    if (!address || !signer || !parsedOrders || !selectedPool || !proxyAddr || !traderAPI) {
      return;
    }
    setRequestSent(true);
    requestSentRef.current = true;
    orderDigest(parsedOrders, address)
      .then((data) => {
        if (data.data.digests.length > 0) {
          approveMarginToken(signer, selectedPool.marginTokenAddr, proxyAddr, collateralDeposit).then(() => {
            // trader doesn't need to sign if sending his own orders: signatures are dummy zero hashes
            const signatures = new Array<string>(data.data.digests.length).fill(ethers.constants.HashZero);
            postOrder(signer, signatures, data.data).then((tx: ContractTransaction) => {
              // success submitting to mempool
              console.log(`posted hash: ${tx.hash}`);
              setShowReviewOrderModal(false);
              setPostOrderTransaction(tx);
              setPendingOrderId(data.data.orderIds[0]);
              toast.success(<ToastContent title="Order submit processed" bodyLines={[]} />);
            });
          });
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.error(error);
        // not waiting for trade and no tx to watch
        setIsAwaitingExecution(false);
        setPostOrderTransaction(null);
      })
      .finally(() => {
        // release lock
        requestSentRef.current = false;
        setRequestSent(false);
      });
  }, [
    parsedOrders,
    address,
    signer,
    selectedPool,
    proxyAddr,
    collateralDeposit,
    traderAPI,
    requestSentRef,
    setRequestSent,
    setShowReviewOrderModal,
    setIsAwaitingExecution,
    setPendingOrderId,
  ]);

  const atPrice = useMemo(() => {
    if (orderInfo) {
      let price = orderInfo.midPrice;
      if (orderInfo.orderType === OrderTypeE.Limit && orderInfo.limitPrice) {
        price = orderInfo.limitPrice;
      } else if (orderInfo.orderType === OrderTypeE.Stop && orderInfo.triggerPrice) {
        price = orderInfo.triggerPrice;
      }
      return formatToCurrency(price, orderInfo.quoteCurrency);
    }
    return '-';
  }, [orderInfo]);

  const validityCheckText = useMemo(() => {
    if (!maxOrderSize || !orderInfo || !selectedPerpetualStaticInfo || !marginTokenBalance.data) {
      return '-';
    }

    let isTooLarge;
    if (orderInfo.orderBlock === OrderBlockE.Long) {
      isTooLarge = orderInfo.size > maxOrderSize.buy;
    } else {
      isTooLarge = orderInfo.size > maxOrderSize.sell;
    }
    if (isTooLarge) {
      return 'Order will fail: order size is too large';
    }
    const isTooSmall = orderInfo.size > 0 && orderInfo.size < selectedPerpetualStaticInfo.lotSizeBC;
    if (isTooSmall) {
      return 'Order will fail: order size is too small';
    }
    if (orderInfo.orderType === OrderTypeE.Market && Number(marginTokenBalance.data.formatted) < collateralDeposit) {
      return 'Order will fail: insufficient wallet balance';
    }
    return 'Good to go';
  }, [maxOrderSize, orderInfo, selectedPerpetualStaticInfo, marginTokenBalance, collateralDeposit]);

  const isConfirmButtonDisabled = useMemo(() => {
    return validityCheckText !== 'Good to go' || requestSentRef.current || requestSent;
  }, [validityCheckText, requestSent]);

  return (
    <Box className={styles.root}>
      <Button
        variant="primary"
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
                {orderInfo.leverage > 0 ? `${formatNumber(orderInfo.leverage)}x` : ''} {orderInfo.orderType}{' '}
                {orderBlockMap[orderInfo.orderBlock]}
              </Typography>
              <Typography variant="bodySmall" className={styles.centered}>
                {orderInfo.size} {orderInfo.baseCurrency} @ {atPrice}
              </Typography>
            </Box>
            <Box className={styles.orderDetails}>
              <SidesRow leftSide="Trading fee:" rightSide={formatToCurrency(orderInfo.tradingFee, 'bps', 1)} />
              <SidesRow
                leftSide="Deposit from wallet:"
                rightSide={newPositionRisk ? formatToCurrency(collateralDeposit, orderInfo.poolName) : '-'}
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
                    ? formatToCurrency(newPositionRisk.positionNotionalBaseCCY, orderInfo.baseCurrency)
                    : '-'
                }
              />
              <SidesRow
                leftSide="Margin:"
                rightSide={newPositionRisk ? formatToCurrency(newPositionRisk.collateralCC, orderInfo.poolName) : '-'}
              />
              <SidesRow
                leftSide="Leverage:"
                rightSide={
                  newPositionRisk && newPositionRisk.positionNotionalBaseCCY !== 0
                    ? `${formatNumber(newPositionRisk?.leverage)}x`
                    : '-'
                }
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
                {validityCheckText}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeReviewOrderModal} variant="secondary" size="small">
              Cancel
            </Button>
            <Button onClick={handleOrderConfirm} variant="primary" size="small" disabled={isConfirmButtonDisabled}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
});
