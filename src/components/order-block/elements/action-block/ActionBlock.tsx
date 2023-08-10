import { useAtom } from 'jotai';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAccount, useChainId, useSigner } from 'wagmi';
import { Separator } from 'components/separator/Separator';

import { Box, Button, CircularProgress, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import { approveMarginToken } from 'blockchain-api/approveMarginToken';
import { postOrder } from 'blockchain-api/contract-interactions/postOrder';
import { Dialog } from 'components/dialog/Dialog';
import { SidesRow } from 'components/sides-row/SidesRow';
import { ToastContent } from 'components/toast-content/ToastContent';
import { getOpenOrders, orderDigest, positionRiskOnTrade } from 'network/network';
import { clearInputsDataAtom, orderInfoAtom } from 'store/order-block.store';
import {
  collateralDepositAtom,
  newPositionRiskAtom,
  openOrdersAtom,
  perpetualStaticInfoAtom,
  poolTokenBalanceAtom,
  poolTokenDecimalsAtom,
  positionsAtom,
  proxyAddrAtom,
  selectedPerpetualAtom,
  selectedPoolAtom,
  traderAPIAtom,
} from 'store/pools.store';
import { OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from 'types/enums';
import { OrderI, OrderInfoI } from 'types/types';
import { formatNumber } from 'utils/formatNumber';
import { formatToCurrency } from 'utils/formatToCurrency';
import { mapExpiryToNumber } from 'utils/mapExpiryToNumber';

import styles from './ActionBlock.module.scss';
import { useDebounce } from 'helpers/useDebounce';
import { toUtf8String } from '@ethersproject/strings';
import { HashZero } from '@ethersproject/constants';

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

  let deadlineMultiplier = 200; // By default, is it set to 200 hours
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
    executionTimestamp: Math.floor(Date.now() / 1000 - 10),
    deadline: Math.floor(Date.now() / 1000 + 60 * 60 * deadlineMultiplier),
  };
}

const orderBlockMap: Record<OrderBlockE, string> = {
  [OrderBlockE.Long]: 'pages.trade.action-block.order-action.long',
  [OrderBlockE.Short]: 'pages.trade.action-block.order-action.short',
};

const orderTypeMap: Record<OrderTypeE, string> = {
  [OrderTypeE.Market]: 'pages.trade.action-block.order-types.market',
  [OrderTypeE.Limit]: 'pages.trade.action-block.order-types.limit',
  [OrderTypeE.Stop]: 'pages.trade.action-block.order-types.stop',
};

enum ValidityCheckE {
  Empty = '-',
  Closed = 'closed',
  OrderTooLarge = 'order-too-large',
  OrderTooSmall = 'order-too-small',
  PositionTooSmall = 'position-too-small',
  BelowMinPosition = 'below-min-position',
  InsufficientBalance = 'insufficient-balance',
  Undefined = 'undefined',
  GoodToGo = 'good-to-go',
}

export const ActionBlock = memo(() => {
  const { t } = useTranslation();
  const { address } = useAccount();
  const chainId = useChainId();

  const { data: signer } = useSigner({
    onError(error) {
      console.log(error);
    },
  });

  const [orderInfo] = useAtom(orderInfoAtom);
  const [proxyAddr] = useAtom(proxyAddrAtom);
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [selectedPerpetualStaticInfo] = useAtom(perpetualStaticInfoAtom);
  const [newPositionRisk, setNewPositionRisk] = useAtom(newPositionRiskAtom);
  const [positions] = useAtom(positionsAtom);
  const [collateralDeposit, setCollateralDeposit] = useAtom(collateralDepositAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [poolTokenBalance] = useAtom(poolTokenBalanceAtom);
  const [poolTokenDecimals] = useAtom(poolTokenDecimalsAtom);
  const [, clearInputsData] = useAtom(clearInputsDataAtom);
  const [, setOpenOrders] = useAtom(openOrdersAtom);

  const [isValidityCheckDone, setIsValidityCheckDone] = useState(false);
  const [showReviewOrderModal, setShowReviewOrderModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [maxOrderSize, setMaxOrderSize] = useState<{ maxBuy: number; maxSell: number }>();

  const requestSentRef = useRef(false);
  const traderAPIRef = useRef(traderAPI);
  const validityCheckRef = useRef(false);

  useEffect(() => {
    traderAPIRef.current = traderAPI;
  });

  const openReviewOrderModal = useCallback(async () => {
    if (!orderInfo || !address || !traderAPIRef.current) {
      return;
    }
    validityCheckRef.current = true;
    setShowReviewOrderModal(true);
    setNewPositionRisk(null);
    setMaxOrderSize(undefined);
    const mainOrder = createMainOrder(orderInfo);
    await positionRiskOnTrade(
      chainId,
      traderAPIRef.current,
      mainOrder,
      address,
      positions?.find((pos) => pos.symbol === orderInfo.symbol)
    )
      .then((data) => {
        setNewPositionRisk(data.data.newPositionRisk);
        setCollateralDeposit(data.data.orderCost);
        setMaxOrderSize({ maxBuy: data.data.maxLongTrade, maxSell: data.data.maxShortTrade });
      })
      .catch(console.error)
      .finally(() => {
        validityCheckRef.current = false;
      });
  }, [orderInfo, chainId, address, positions, setNewPositionRisk, setCollateralDeposit]);

  const closeReviewOrderModal = useCallback(() => {
    setShowReviewOrderModal(false);
    setIsValidityCheckDone(false);
  }, []);

  const isBuySellButtonActive = useMemo(() => {
    if (!orderInfo || !address) {
      return false;
    }
    if (!orderInfo.size) {
      return false;
    }
    if (orderInfo.orderType === OrderTypeE.Limit && (orderInfo.limitPrice === null || orderInfo.limitPrice <= 0)) {
      return false;
    }
    return !(orderInfo.orderType === OrderTypeE.Stop && (!orderInfo.triggerPrice || orderInfo.triggerPrice <= 0));
  }, [orderInfo, address]);

  const parsedOrders = useMemo(() => {
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
        deadline: Math.floor(Date.now() / 1000 + 60 * 60 * SECONDARY_DEADLINE_MULTIPLIER),

        // Same as for main Order
        symbol: orderInfo.symbol,
        quantity: orderInfo.size,
        leverage: orderInfo.leverage,
        reduceOnly: orderInfo.reduceOnly !== null ? orderInfo.reduceOnly : undefined,
        keepPositionLvg: orderInfo.keepPositionLeverage,
        executionTimestamp: Math.floor(Date.now() / 1000 - 10),
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
        executionTimestamp: Math.floor(Date.now() / 1000 - 10),
      });
    }
    return orders;
  }, [orderInfo, selectedPool, address, proxyAddr, requestSent, isBuySellButtonActive]);

  const handleOrderConfirm = useCallback(async () => {
    if (!address || !signer || !parsedOrders || !selectedPool || !proxyAddr || !poolTokenDecimals) {
      return;
    }
    setRequestSent(true);
    setIsValidityCheckDone(false);
    requestSentRef.current = true;
    await orderDigest(chainId, parsedOrders, address)
      .then((data) => {
        if (data.data.digests.length > 0) {
          approveMarginToken(
            signer,
            selectedPool.marginTokenAddr,
            proxyAddr,
            collateralDeposit,
            poolTokenDecimals
          ).then((res) => {
            if (res?.hash) {
              console.log(res.hash);
            }
            // trader doesn't need to sign if sending his own orders: signatures are dummy zero hashes
            const signatures = new Array<string>(data.data.digests.length).fill(HashZero);
            postOrder(signer, signatures, data.data)
              .then(async (tx) => {
                // success submitting to mempool
                console.log(`postOrder tx hash: ${tx.hash}`);
                setShowReviewOrderModal(false);
                toast.success(
                  <ToastContent title={t('pages.trade.action-block.toasts.processed.title')} bodyLines={[]} />
                );
                clearInputsData();
                // release lock
                requestSentRef.current = false;
                setRequestSent(false);
                await tx
                  .wait()
                  .then((receipt) => {
                    requestSentRef.current = false;
                    setRequestSent(false);
                    if (receipt.status === 1) {
                      const toastTile =
                        parsedOrders.length > 1
                          ? t('pages.trade.action-block.toasts.orders-submitted.title')
                          : t('pages.trade.action-block.toasts.order-submitted.title');
                      toast.success(
                        <ToastContent
                          title={toastTile}
                          bodyLines={[
                            {
                              label: t('pages.trade.action-block.toasts.orders-submitted.body'),
                              value: parsedOrders[0].symbol,
                            },
                          ]}
                        />
                      );
                    } else {
                      toast.error(
                        <ToastContent title={t('pages.trade.action-block.toasts.error.title')} bodyLines={[]} />
                      );
                    }
                  })
                  .catch(async (err) => {
                    console.error(err);
                    const response = await signer.call(
                      {
                        to: tx.to,
                        from: tx.from,
                        nonce: tx.nonce,
                        gasLimit: tx.gasLimit,
                        gasPrice: tx.gasPrice,
                        data: tx.data,
                        value: tx.value,
                        chainId: tx.chainId,
                        type: tx.type ?? undefined,
                        accessList: tx.accessList,
                      },
                      tx.blockNumber
                    );
                    const reason = toUtf8String('0x' + response.substring(138)).replace(/\0/g, '');
                    requestSentRef.current = false;
                    setRequestSent(false);
                    if (reason !== '') {
                      toast.error(
                        <ToastContent
                          title={t('pages.trade.action-block.toasts.tx-failed.title')}
                          bodyLines={[{ label: t('pages.trade.action-block.toasts.tx-failed.body'), value: reason }]}
                        />
                      );
                    }
                  })
                  .finally(() => {
                    getOpenOrders(chainId, traderAPIRef.current, parsedOrders[0].symbol, address)
                      .then(({ data: d }) => {
                        if (d && d.length > 0) {
                          d.map((o) => setOpenOrders(o));
                        }
                      })
                      .catch(console.error);
                  });
              })
              .catch((error) => {
                requestSentRef.current = false;
                setRequestSent(false);
                console.error(error);
                // let msg = (error?.message ?? error) as string;
                // msg = msg.length > 30 ? `${msg.slice(0, 25)}...` : msg;
                // toast.error(
                //   <ToastContent title="Error Processing Transaction" bodyLines={[{ label: 'Reason', value: msg }]} />
                // );
              });
          });
        }
      })
      .catch((error) => {
        console.error(error);
        requestSentRef.current = false;
        setRequestSent(false);
      });
  }, [
    parsedOrders,
    chainId,
    address,
    signer,
    selectedPool,
    proxyAddr,
    collateralDeposit,
    poolTokenDecimals,
    clearInputsData,
    setOpenOrders,
    t,
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

  const isMarketClosed = useDebounce(
    useMemo(() => {
      return selectedPerpetual && selectedPerpetual.isMarketClosed;
    }, [selectedPerpetual]),
    30_000
  );

  const positionToModify = useDebounce(
    useMemo(() => {
      return positions?.find((pos) => pos.symbol === orderInfo?.symbol);
    }, [positions, orderInfo?.symbol]),
    1_000
  );

  const validityCheckType = useMemo(() => {
    if (
      !showReviewOrderModal ||
      validityCheckRef.current ||
      !maxOrderSize ||
      !orderInfo?.orderBlock ||
      !selectedPerpetualStaticInfo
    ) {
      return ValidityCheckE.Empty;
    }
    if (isMarketClosed) {
      return ValidityCheckE.Closed;
    }
    let isTooLarge;
    if (orderInfo.orderBlock === OrderBlockE.Long) {
      isTooLarge = orderInfo.size > maxOrderSize.maxBuy;
    } else {
      isTooLarge = orderInfo.size > maxOrderSize.maxSell;
    }
    if (isTooLarge) {
      return ValidityCheckE.OrderTooLarge;
    }
    const isOrderTooSmall = orderInfo.size > 0 && orderInfo.size < selectedPerpetualStaticInfo.lotSizeBC;
    if (isOrderTooSmall) {
      return ValidityCheckE.OrderTooSmall;
    }
    const isPositionTooSmall =
      (!positionToModify || positionToModify.positionNotionalBaseCCY === 0) &&
      orderInfo.size < 10 * selectedPerpetualStaticInfo.lotSizeBC;
    if (isPositionTooSmall && orderInfo.orderType === OrderTypeE.Market) {
      return ValidityCheckE.PositionTooSmall;
    } else if (
      orderInfo.size < 10 * selectedPerpetualStaticInfo.lotSizeBC &&
      orderInfo.orderType !== OrderTypeE.Market
    ) {
      return ValidityCheckE.BelowMinPosition;
    }
    if (poolTokenBalance === undefined || poolTokenBalance < 1.1 * collateralDeposit) {
      return ValidityCheckE.InsufficientBalance;
      // return `${t('pages.trade.action-block.validity.insufficient-balance')} {' '} ${poolTokenBalance}`;
    }
    if (orderInfo.takeProfitPrice !== null && orderInfo.takeProfitPrice <= 0) {
      return ValidityCheckE.Undefined;
    }
    return ValidityCheckE.GoodToGo;
  }, [
    maxOrderSize,
    orderInfo?.size,
    orderInfo?.orderBlock,
    orderInfo?.orderType,
    orderInfo?.takeProfitPrice,
    selectedPerpetualStaticInfo,
    poolTokenBalance,
    isMarketClosed,
    collateralDeposit,
    positionToModify,
    showReviewOrderModal,
  ]);

  const validityCheckText = useMemo(() => {
    if (validityCheckType === ValidityCheckE.Empty) {
      return '-';
    } else if (validityCheckType === ValidityCheckE.InsufficientBalance) {
      return `${t('pages.trade.action-block.validity.insufficient-balance')} {' '} ${poolTokenBalance}`;
    }
    return t(`pages.trade.action-block.validity.${validityCheckType}`);
  }, [t, validityCheckType, poolTokenBalance]);

  const isOrderValid =
    validityCheckType === ValidityCheckE.GoodToGo ||
    validityCheckType === ValidityCheckE.Closed ||
    validityCheckType === ValidityCheckE.BelowMinPosition;

  const isConfirmButtonDisabled = useMemo(() => {
    return !isOrderValid || requestSentRef.current || requestSent;
  }, [isOrderValid, requestSent]);

  const validityColor = validityCheckType === ValidityCheckE.GoodToGo 
    ? 'rgba(var(--d8x-background-buy-rgb), 1)' 
    : 'rgba(var(--d8x-background-sell-rgb), 1)';

  useEffect(() => {
    if (validityCheckType === ValidityCheckE.GoodToGo) {
      setIsValidityCheckDone(true);
      return;
    } else if (validityCheckType === ValidityCheckE.Empty) {
      setIsValidityCheckDone(false);
      return;
    }
    setIsValidityCheckDone(true);
    return;
  }, [validityCheckType]);

  const feePct = useMemo(() => {
    if (orderInfo?.tradingFee) {
      return (
        (orderInfo.tradingFee * 0.01) / (1 + (orderInfo.stopLossPrice ? 1 : 0) + (orderInfo.takeProfitPrice ? 1 : 0))
      );
    }
  }, [orderInfo]);

  return (
    <Box className={styles.root}>
      <Button
        variant={orderInfo?.orderBlock === OrderBlockE.Short ? 'sell' : 'buy'}
        disabled={!isBuySellButtonActive}
        onClick={openReviewOrderModal}
        className={styles.buyButton}
      >
        {t(orderBlockMap[orderInfo?.orderBlock ?? OrderBlockE.Long])}{' '}
        {t(orderTypeMap[orderInfo?.orderType ?? OrderTypeE.Market])}
      </Button>
      {orderInfo && (
        <Dialog open={showReviewOrderModal} className={styles.dialog}>
          <DialogTitle className={styles.dialogTitle}> {t('pages.trade.action-block.review.title')} </DialogTitle>
          <Box className={styles.emphasis}>
            <SidesRow
              leftSide={
                <Typography variant="bodyLargePopup" className={styles.semibold}>
                  {orderInfo.leverage > 0 ? `${formatNumber(orderInfo.leverage)}x` : ''}{' '}
                  {t(orderTypeMap[orderInfo.orderType])} {t(orderBlockMap[orderInfo.orderBlock])}
                </Typography>
              }
              rightSide={
                <Typography variant="bodyLargePopup" className={styles.semibold}>
                  {orderInfo.size} {orderInfo.baseCurrency} @ {atPrice}
                </Typography>
              }
            />
          </Box>
          <DialogContent>
            <Box className={styles.orderDetails}>
              <SidesRow
                leftSide={
                  <Typography variant="bodySmallPopup" className={styles.left}>
                    {' '}
                    {t('pages.trade.action-block.review.deposit')}{' '}
                  </Typography>
                }
                rightSide={
                  isOrderValid && collateralDeposit >= 0 ? formatToCurrency(collateralDeposit, orderInfo.poolName) : '-'
                }
                rightSideStyles={styles.rightSide}
              />
              <SidesRow
                leftSide={
                  <Typography variant="bodySmallPopup" className={styles.left}>
                    {' '}
                    {t('pages.trade.action-block.review.balance')}{' '}
                  </Typography>
                }
                rightSide={
                  isOrderValid && poolTokenBalance && poolTokenBalance >= 0
                    ? formatToCurrency(poolTokenBalance, orderInfo.poolName)
                    : '-'
                }
                rightSideStyles={styles.rightSide}
              />
              <SidesRow
                leftSide={
                  <Typography variant="bodySmallPopup" className={styles.left}>
                    {' '}
                    {t('pages.trade.action-block.review.fee')}{' '}
                  </Typography>
                }
                rightSide={feePct ? formatToCurrency(feePct, '%', false, 3) : '-'}
                rightSideStyles={styles.rightSide}
              />

              {orderInfo.maxMinEntryPrice !== null && (
                <SidesRow
                  leftSide={
                    <Typography variant="bodySmallPopup" className={styles.left}>
                      {orderInfo.orderBlock === OrderBlockE.Long
                        ? t('pages.trade.action-block.review.max')
                        : t('pages.trade.action-block.review.min')}
                    </Typography>
                  }
                  rightSide={formatToCurrency(orderInfo.maxMinEntryPrice, orderInfo.quoteCurrency)}
                  rightSideStyles={styles.rightSide}
                />
              )}
              {orderInfo.triggerPrice !== null && (
                <SidesRow
                  leftSide={
                    <Typography variant="bodySmallPopup" className={styles.left}>
                      {' '}
                      {t('pages.trade.action-block.review.trigger-price')}{' '}
                    </Typography>
                  }
                  rightSide={formatToCurrency(orderInfo.triggerPrice, orderInfo.quoteCurrency)}
                  rightSideStyles={styles.rightSide}
                />
              )}
              {orderInfo.limitPrice !== null && (
                <SidesRow
                  leftSide={
                    <Typography variant="bodySmallPopup" className={styles.left}>
                      {' '}
                      {t('pages.trade.action-block.review.limit-price')}{' '}
                    </Typography>
                  }
                  rightSide={
                    orderInfo.limitPrice > -1 && orderInfo.limitPrice < Infinity
                      ? formatToCurrency(orderInfo.limitPrice, orderInfo.quoteCurrency)
                      : '-'
                  }
                  rightSideStyles={styles.rightSide}
                />
              )}
              <SidesRow
                leftSide={
                  <Typography variant="bodySmallPopup" className={styles.left}>
                    {' '}
                    {t('pages.trade.action-block.review.stop-loss')}{' '}
                  </Typography>
                }
                rightSide={
                  orderInfo.stopLossPrice && orderInfo.stopLossPrice > 0
                    ? formatToCurrency(orderInfo.stopLossPrice, orderInfo.quoteCurrency)
                    : '-'
                }
                rightSideStyles={styles.rightSide}
              />
              <SidesRow
                leftSide={
                  <Typography variant="bodySmallPopup" className={styles.left}>
                    {' '}
                    {t('pages.trade.action-block.review.take-profit')}{' '}
                  </Typography>
                }
                rightSide={
                  orderInfo.takeProfitPrice && orderInfo.takeProfitPrice > 0
                    ? formatToCurrency(orderInfo.takeProfitPrice, orderInfo.quoteCurrency)
                    : '-'
                }
                rightSideStyles={styles.rightSide}
              />
            </Box>
          </DialogContent>
          <Separator />
          <DialogContent>
            <Box className={styles.newPositionHeader}>
              <Typography variant="bodyMediumPopup" className={styles.bold}>
                {t('pages.trade.action-block.review.details')}
              </Typography>
            </Box>
            <Box className={styles.newPositionDetails}>
              <SidesRow
                leftSide={
                  <Typography variant="bodySmallPopup" className={styles.left}>
                    {' '}
                    {t('pages.trade.action-block.review.size')}{' '}
                  </Typography>
                }
                rightSide={
                  isOrderValid && newPositionRisk
                    ? formatToCurrency(newPositionRisk.positionNotionalBaseCCY, orderInfo.baseCurrency)
                    : '-'
                }
                rightSideStyles={styles.rightSide}
              />
              <SidesRow
                leftSide={
                  <Typography variant="bodySmallPopup" className={styles.left}>
                    {' '}
                    {t('pages.trade.action-block.review.margin')}{' '}
                  </Typography>
                }
                rightSide={
                  isOrderValid && newPositionRisk && newPositionRisk.collateralCC >= 0
                    ? formatToCurrency(newPositionRisk.collateralCC, orderInfo.poolName)
                    : '-'
                }
                rightSideStyles={styles.rightSide}
              />
              <SidesRow
                leftSide={
                  <Typography variant="bodySmallPopup" className={styles.left}>
                    {' '}
                    {t('pages.trade.action-block.review.leverage')}{' '}
                  </Typography>
                }
                rightSide={
                  isOrderValid && newPositionRisk && newPositionRisk.leverage > 0 && newPositionRisk.leverage < Infinity
                    ? `${formatNumber(newPositionRisk.leverage)}x`
                    : '-'
                }
                rightSideStyles={styles.rightSide}
              />
              <SidesRow
                leftSide={
                  <Typography variant="bodySmallPopup" className={styles.left}>
                    {' '}
                    {t('pages.trade.action-block.review.liq-price')}{' '}
                  </Typography>
                }
                rightSide={
                  isOrderValid &&
                  newPositionRisk &&
                  newPositionRisk.liquidationPrice[0] > 0 &&
                  newPositionRisk.liquidationPrice[0] < Infinity
                    ? formatToCurrency(newPositionRisk.liquidationPrice[0] ?? 0, orderInfo.quoteCurrency)
                    : '-'
                }
                rightSideStyles={styles.rightSide}
              />
            </Box>
          </DialogContent>
          <Box className={styles.emphasis}>
            <SidesRow
              leftSide={
                <Typography variant="bodyMediumPopup" className={styles.semibold}>
                  {t('pages.trade.action-block.review.validity-checks')}
                </Typography>
              }
              rightSide={
                !isValidityCheckDone ? (
                  <Box className={styles.loaderHolder}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <Typography variant="bodyMediumPopup" className={styles.bold} style={{ color: validityColor }}>
                    {validityCheckType !== ValidityCheckE.Empty
                      ? t(
                          `pages.trade.action-block.validity.${
                            validityCheckType === ValidityCheckE.GoodToGo ? 'pass' : 'fail'
                          }`
                        )
                      : ' '}
                  </Typography>
                )
              }
            />
          </Box>
          <DialogContent>
            {isValidityCheckDone ? (
              <Box className={styles.goMessage}>
                <Typography variant="bodySmallPopup" className={styles.centered} style={{ color: validityColor }}>
                  {validityCheckText}
                </Typography>
              </Box>
            ) : (
              ''
            )}
          </DialogContent>
          <DialogActions className={styles.dialogActions}>
            <Button onClick={closeReviewOrderModal} variant="secondary" size="small">
              {t('pages.trade.action-block.review.cancel')}
            </Button>
            <Button onClick={handleOrderConfirm} variant="primary" size="small" disabled={isConfirmButtonDisabled}>
              {t('pages.trade.action-block.review.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
});
