import { useAtom } from 'jotai';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useAccount, useSigner, useBalance, useSignMessage, usePrepareContractWrite, useContractWrite } from 'wagmi';
import { LOB_ABI } from 'blockchain-api/constants';
import { Buffer } from 'buffer';
import { MarketData, PerpetualDataHandler } from '@d8x/perpetuals-sdk';

import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import { approveMarginToken } from 'blockchain-api/approveMarginToken';
// import { postOrder } from 'blockchain-api/contract-interactions/postOrder';
// import { signMessages } from 'blockchain-api/signMessage';
import { Dialog } from 'components/dialog/Dialog';
import { SidesRow } from 'components/sides-row/SidesRow';
import { getMaxOrderSizeForTrader, orderDigest, positionRiskOnTrade } from 'network/network';
import { orderInfoAtom } from 'store/order-block.store';
import {
  collateralDepositAtom,
  newPositionRiskAtom,
  perpetualStaticInfoAtom,
  proxyAddrAtom,
  selectedPoolAtom,
} from 'store/pools.store';
import { OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from 'types/enums';
import { MaxOrderSizeResponseI, OrderI, OrderInfoI, SmartContractOrderI } from 'types/types';
import { formatNumber } from 'utils/formatNumber';
import { formatToCurrency } from 'utils/formatToCurrency';
import { mapExpiryToNumber } from 'utils/mapExpiryToNumber';

import styles from './ActionBlock.module.scss';
import { BigNumber, ethers } from 'ethers';

const orderBlockMap: Record<OrderBlockE, string> = {
  [OrderBlockE.Long]: 'Buy',
  [OrderBlockE.Short]: 'Sell',
};

// const perpSDKConfig = PerpetualDataHandler.readSDKConfig("central-park");
// const mktData = new MarketData(perpSDKConfig);

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
  // const [postOrderABI, setPostOrderABI] = useAtom(abiAtom);

  const limitOrderBookAddr = useRef<string>('0x');
  const orderSignatures = useRef<`0x${string}`[]>([]);
  const scOrders = useRef<SmartContractOrderI[]>([]);

  const [showReviewOrderModal, setShowReviewOrderModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [maxOrderSize, setMaxOrderSize] = useState<MaxOrderSizeResponseI>();
  // const [scOrders, setSCOrders] = useState<SmartContractOrderI[]>([]);
  // const [orderSignatures, setOrderSignatures] = useState<string[]>([]);

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
    positionRiskOnTrade(mainOrder, address).then((data) => {
      setNewPositionRisk(data.data.newPositionRisk);
      setCollateralDeposit(data.data.orderCost);
    });

    setMaxOrderSize(undefined);
    getMaxOrderSizeForTrader(mainOrder.symbol, address, Date.now()).then((data) => {
      setMaxOrderSize(data.data);
    });
  }, [orderInfo, address, setNewPositionRisk, setCollateralDeposit]);

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

  const { config: postOrdersConfig, error: perparePostOrdersError } = usePrepareContractWrite({
    address: limitOrderBookAddr.current as `0x${string}`,
    abi: LOB_ABI,
    functionName: 'postOrders',
    args: [scOrders.current, orderSignatures.current],
    overrides: {
      gasLimit: ethers.BigNumber.from(3_000_000),
    },
    enabled: limitOrderBookAddr.current !== '0x' && orderSignatures.current.length > 0 && scOrders.current.length > 0,
  });

  const { signMessageAsync } = useSignMessage();

  const {
    data: postOrderdata,
    error: postOrdersError,
    isError,
    write: postOrders,
  } = useContractWrite(postOrdersConfig);

  // const { isLoading, isSuccess } = useWaitForTransaction({
  //   hash: postOrderdata?.hash,
  // })

  const handleOrderConfirm = useCallback(() => {
    if (!address || !signer || !parsedOrders || !selectedPool || !proxyAddr) {
      return;
    }
    setRequestSent(true);
    requestSentRef.current = true;
    orderDigest(parsedOrders, address)
      .then((data) => {
        if (data.data.digests.length > 0) {
          limitOrderBookAddr.current = data.data.OrderBookAddr;
          approveMarginToken(signer, selectedPool.marginTokenAddr, proxyAddr, collateralDeposit)
            .then(() => {
              Promise.all(
                data.data.digests.map((dgst) => signMessageAsync({ message: Buffer.from(dgst.slice(2), 'hex') }))
              )
                .then((signatures) => {
                  scOrders.current = data.data.SCOrders;
                  orderSignatures.current = signatures;
                  setShowReviewOrderModal(false);
                  requestSentRef.current = false;
                  setRequestSent(false);
                  scOrders.current = [];
                  orderSignatures.current = [];
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((error: any) => {
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
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.error(error);
        requestSentRef.current = false;
        setRequestSent(false);
      });
    postOrders?.();
  }, [
    parsedOrders,
    address,
    signer,
    selectedPool,
    proxyAddr,
    collateralDeposit,
    signMessageAsync,
    limitOrderBookAddr,
    postOrders,
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
            <Button
              onClick={handleOrderConfirm}
              variant="primary"
              size="small"
              disabled={!postOrders || isConfirmButtonDisabled}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
});
