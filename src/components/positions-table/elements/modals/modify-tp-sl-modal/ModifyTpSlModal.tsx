import classNames from 'classnames';
import { useAtom } from 'jotai';
import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Address, useAccount, useChainId, useWaitForTransaction, useWalletClient } from 'wagmi';

import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { HashZero, SECONDARY_DEADLINE_MULTIPLIER } from 'app-constants';
import { approveMarginToken } from 'blockchain-api/approveMarginToken';
import { cancelOrder } from 'blockchain-api/contract-interactions/cancelOrder';
import { postOrder } from 'blockchain-api/contract-interactions/postOrder';
import { Dialog } from 'components/dialog/Dialog';
import { Separator } from 'components/separator/Separator';
import { ToastContent } from 'components/toast-content/ToastContent';
import { parseSymbol } from 'helpers/parseSymbol';
import { getCancelOrder, orderDigest } from 'network/network';
import { tradingClientAtom } from 'store/app.store';
import { latestOrderSentTimestampAtom } from 'store/order-block.store';
import { poolsAtom, proxyAddrAtom, traderAPIAtom } from 'store/pools.store';
import { OpenOrderTypeE, OrderSideE } from 'types/enums';
import { MarginAccountWithLiqPriceI, OrderI } from 'types/types';
import { formatToCurrency } from 'utils/formatToCurrency';

import { StopLossSelector } from './components/StopLossSelector';
import { TakeProfitSelector } from './components/TakeProfitSelector';

import styles from '../Modal.module.scss';
import { useSetAtom } from 'jotai/index';

interface ModifyModalPropsI {
  isOpen: boolean;
  selectedPosition?: MarginAccountWithLiqPriceI | null;
  closeModal: () => void;
}

export const ModifyTpSlModal = memo(({ isOpen, selectedPosition, closeModal }: ModifyModalPropsI) => {
  const { t } = useTranslation();

  const { address } = useAccount();
  const chainId = useChainId();

  const { data: walletClient } = useWalletClient({
    chainId: chainId,
    onError(error) {
      console.log(error);
    },
  });

  const [pools] = useAtom(poolsAtom);
  const [proxyAddr] = useAtom(proxyAddrAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [tradingClient] = useAtom(tradingClientAtom);
  const setLatestOrderSentTimestamp = useSetAtom(latestOrderSentTimestampAtom);

  const [takeProfitPrice, setTakeProfitPrice] = useState<number | null>(null);
  const [stopLossPrice, setStopLossPrice] = useState<number | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [txHash, setTxHash] = useState<Address | undefined>(undefined);

  const requestSentRef = useRef(false);

  useWaitForTransaction({
    hash: txHash,
    onSuccess() {
      setLatestOrderSentTimestamp(Date.now());
      toast.success(
        <ToastContent
          title={t('pages.trade.action-block.toasts.order-submitted.title')}
          bodyLines={[
            {
              label: t('pages.trade.action-block.toasts.order-submitted.body'),
              value: selectedPosition?.symbol,
            },
          ]}
        />
      );
    },
    onError() {
      toast.error(<ToastContent title={t('pages.trade.action-block.toasts.error.title')} bodyLines={[]} />);
    },
    onSettled() {
      setTxHash(undefined);
      setLatestOrderSentTimestamp(Date.now());
    },
    enabled: !!address && !!selectedPosition?.symbol && !!txHash,
  });

  if (!selectedPosition) {
    return null;
  }

  const parsedSymbol = parseSymbol(selectedPosition.symbol);

  const handleModifyPositionConfirm = async () => {
    if (!selectedPosition || requestSentRef.current || !tradingClient || !address || !proxyAddr || !walletClient) {
      return;
    }

    requestSentRef.current = true;
    setRequestSent(true);

    const ordersToCancel = selectedPosition.openOrders.filter(
      (openOrder) =>
        // takeProfit openOrders
        openOrder.type === OpenOrderTypeE.Limit ||
        // stopLoss openOrders
        (openOrder.type === OpenOrderTypeE.StopLimit &&
          ((openOrder.side === OrderSideE.Sell &&
            openOrder.limitPrice &&
            openOrder.limitPrice === 0 &&
            openOrder.stopPrice &&
            openOrder.stopPrice <= selectedPosition.entryPrice) ||
            (openOrder.side === OrderSideE.Buy &&
              openOrder.limitPrice &&
              openOrder.limitPrice === Number.POSITIVE_INFINITY &&
              openOrder.stopPrice &&
              openOrder.stopPrice >= selectedPosition.entryPrice)))
    );

    if (ordersToCancel.length > 0) {
      const cancelOrdersPromises: Promise<void>[] = [];
      for (const orderToCancel of ordersToCancel) {
        cancelOrdersPromises.push(
          getCancelOrder(chainId, traderAPI, orderToCancel.symbol, orderToCancel.id)
            .then((data) => {
              if (data.data.digest) {
                cancelOrder(tradingClient, HashZero, data.data, orderToCancel.id)
                  .then((tx) => {
                    console.log(`cancelOrder tx hash: ${tx.hash}`);
                    toast.success(
                      <ToastContent title={t('pages.trade.orders-table.toasts.cancel-order.title')} bodyLines={[]} />
                    );
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }
            })
            .catch((error) => {
              console.error(error);
            })
        );
      }
      await Promise.all(cancelOrdersPromises);
    }

    const parsedOrders: OrderI[] = [];
    if (takeProfitPrice !== null) {
      parsedOrders.push({
        // Changed values comparing to main Order
        side: selectedPosition.side === OrderSideE.Buy ? OrderSideE.Sell : OrderSideE.Buy,
        type: OpenOrderTypeE.Limit,
        limitPrice: takeProfitPrice,
        deadline: Math.floor(Date.now() / 1000 + 60 * 60 * SECONDARY_DEADLINE_MULTIPLIER),

        // Same as for main Order
        symbol: selectedPosition.symbol,
        quantity: selectedPosition.positionNotionalBaseCCY,
        leverage: selectedPosition.leverage,
        // reduceOnly: orderInfo.reduceOnly !== null ? orderInfo.reduceOnly : undefined,
        // keepPositionLvg: orderInfo.keepPositionLeverage,
        executionTimestamp: Math.floor(Date.now() / 1000 - 10 - 200),
      });
    }

    if (stopLossPrice !== null) {
      parsedOrders.push({
        // Changed values comparing to main Order
        side: selectedPosition.side === OrderSideE.Buy ? OrderSideE.Sell : OrderSideE.Buy,
        type: OpenOrderTypeE.StopMarket,
        stopPrice: stopLossPrice,
        deadline: Math.floor(Date.now() / 1000 + 60 * 60 * SECONDARY_DEADLINE_MULTIPLIER),

        // Same as for main Order
        symbol: selectedPosition.symbol,
        quantity: selectedPosition.positionNotionalBaseCCY,
        leverage: selectedPosition.leverage,
        // reduceOnly: orderInfo.reduceOnly !== null ? orderInfo.reduceOnly : undefined,
        // keepPositionLvg: orderInfo.keepPositionLeverage,
        executionTimestamp: Math.floor(Date.now() / 1000 - 10 - 200),
      });
    }

    if (parsedOrders.length > 0) {
      const foundPool = pools.find(({ poolSymbol }) => poolSymbol === parsedSymbol?.poolSymbol);
      if (foundPool) {
        orderDigest(chainId, parsedOrders, address)
          .then((data) => {
            if (data.data.digests.length > 0) {
              // hide modal now that metamask popup shows up
              approveMarginToken(
                walletClient,
                foundPool.marginTokenAddr,
                proxyAddr,
                collateralDeposit,
                poolTokenDecimals
              )
                .then(() => {
                  // trader doesn't need to sign if sending his own orders: signatures are dummy zero hashes
                  const signatures = new Array<string>(data.data.digests.length).fill(HashZero);
                  postOrder(tradingClient, signatures, data.data)
                    .then((tx) => {
                      // success submitting order to the node
                      console.log(`postOrder tx hash: ${tx.hash}`);
                      // order was sent
                      setTakeProfitPrice(null);
                      setStopLossPrice(null);
                      toast.success(
                        <ToastContent
                          title={t('pages.trade.action-block.toasts.processed.title')}
                          bodyLines={[{ label: 'Symbol', value: parsedOrders[0].symbol }]}
                        />
                      );
                      setTxHash(tx.hash);
                    })
                    .finally(() => {
                      // ensure we can trade again - but modal is left open if user rejects txn
                      requestSentRef.current = false;
                      setRequestSent(false);
                    });
                })
                .catch((error) => {
                  // not a transaction error, but probably metamask or network -> no toast
                  console.error(error);
                });
            }
          })
          .catch((error) => {
            // not a transaction error, but probably metamask or network -> no toast
            console.error(error);
          });
      }
    }

    requestSentRef.current = false;
    setRequestSent(false);
    closeModal();
  };

  return (
    <Dialog open={isOpen} className={classNames(styles.root, styles.wide)}>
      <DialogTitle>{t('pages.trade.positions-table.modify-modal.tp-sl-title')}</DialogTitle>
      <DialogContent className={styles.contentWithGap}>
        {t('pages.trade.positions-table.modify-modal.tp-sl-position', {
          positionSize: formatToCurrency(selectedPosition.positionNotionalBaseCCY, parsedSymbol?.baseCurrency, true),
        })}
      </DialogContent>
      <Separator />
      <DialogContent className={styles.selectors}>
        <TakeProfitSelector setTakeProfitPrice={setTakeProfitPrice} position={selectedPosition} />
        <StopLossSelector setStopLossPrice={setStopLossPrice} position={selectedPosition} />
      </DialogContent>
      <Separator />
      <DialogActions>
        <Button onClick={closeModal} variant="secondary" size="small">
          {t('pages.trade.positions-table.modify-modal.cancel')}
        </Button>
        <Button onClick={handleModifyPositionConfirm} variant="primary" size="small" disabled={requestSent}>
          {t('pages.trade.positions-table.modify-modal.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
