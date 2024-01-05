import { useAtom, useSetAtom } from 'jotai';
import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { type Address, useAccount, useChainId, useNetwork, useWaitForTransaction, useWalletClient } from 'wagmi';

import { Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import { HashZero } from 'app-constants';
import { approveMarginToken } from 'blockchain-api/approveMarginToken';
import { postOrder } from 'blockchain-api/contract-interactions/postOrder';
import { Dialog } from 'components/dialog/Dialog';
import { Separator } from 'components/separator/Separator';
import { SidesRow } from 'components/sides-row/SidesRow';
import { ToastContent } from 'components/toast-content/ToastContent';
import { getTxnLink } from 'helpers/getTxnLink';
import { orderDigest } from 'network/network';
import { tradingClientAtom } from 'store/app.store';
import { latestOrderSentTimestampAtom } from 'store/order-block.store';
import { poolTokenDecimalsAtom, proxyAddrAtom, selectedPoolAtom, traderAPIAtom } from 'store/pools.store';
import { OrderSideE, OrderTypeE } from 'types/enums';
import type { MarginAccountWithAdditionalDataI, OrderI } from 'types/types';
import { OrderWithIdI } from 'types/types';

import { cancelOrders } from '../../../helpers/cancelOrders';

import styles from '../Modal.module.scss';

interface CloseModalPropsI {
  isOpen: boolean;
  selectedPosition?: MarginAccountWithAdditionalDataI | null;
  closeModal: () => void;
}

export const CloseModal = memo(({ isOpen, selectedPosition, closeModal }: CloseModalPropsI) => {
  const { t } = useTranslation();

  const [proxyAddr] = useAtom(proxyAddrAtom);
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [poolTokenDecimals] = useAtom(poolTokenDecimalsAtom);
  const setLatestOrderSentTimestamp = useSetAtom(latestOrderSentTimestampAtom);
  const [tradingClient] = useAtom(tradingClientAtom);
  const [traderAPI] = useAtom(traderAPIAtom);

  const chainId = useChainId();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId: chainId });

  const [requestSent, setRequestSent] = useState(false);
  const [txHash, setTxHash] = useState<Address | undefined>(undefined);
  const [symbolForTx, setSymbolForTx] = useState('');
  const [closeOpenOrders, setCloseOpenOrders] = useState(true);

  const requestSentRef = useRef(false);

  useWaitForTransaction({
    hash: txHash,
    onSuccess() {
      toast.success(
        <ToastContent
          title={t('pages.trade.positions-table.toasts.submitted.title')}
          bodyLines={[
            {
              label: t('pages.trade.positions-table.toasts.submitted.body'),
              value: symbolForTx,
            },
            {
              label: '',
              value: (
                <a
                  href={getTxnLink(chain?.blockExplorers?.default?.url, txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.shareLink}
                >
                  {txHash}
                </a>
              ),
            },
          ]}
        />
      );
    },
    onError(reason) {
      toast.error(
        <ToastContent
          title={t('pages.trade.positions-table.toasts.tx-failed.title')}
          bodyLines={[{ label: t('pages.trade.positions-table.toasts.tx-failed.body'), value: reason.message }]}
        />
      );
    },
    onSettled() {
      setTxHash(undefined);
      setSymbolForTx('');
      setLatestOrderSentTimestamp(Date.now());
    },
    enabled: !!address && !!txHash,
  });

  const handleClosePositionConfirm = async () => {
    if (requestSentRef.current) {
      return;
    }

    if (
      !selectedPosition ||
      !address ||
      !selectedPool ||
      !proxyAddr ||
      !walletClient ||
      !tradingClient ||
      !poolTokenDecimals
    ) {
      return;
    }

    requestSentRef.current = true;
    setRequestSent(true);

    const closeOrder: OrderI = {
      symbol: selectedPosition.symbol,
      side: selectedPosition.side === OrderSideE.Buy ? OrderSideE.Sell : OrderSideE.Buy,
      type: OrderTypeE.Market.toUpperCase(),
      quantity: selectedPosition.positionNotionalBaseCCY,
      executionTimestamp: Math.floor(Date.now() / 1000 - 10 - 200),
      reduceOnly: true,
      leverage: selectedPosition.leverage,
    };

    orderDigest(chainId, [closeOrder], address)
      .then((data) => {
        if (data.data.digests.length > 0) {
          approveMarginToken(walletClient, selectedPool.marginTokenAddr, proxyAddr, 0, poolTokenDecimals).then(() => {
            const signatures = new Array<string>(data.data.digests.length).fill(HashZero);
            postOrder(tradingClient, signatures, data.data)
              .then((tx) => {
                setTxHash(tx.hash);
                setSymbolForTx(selectedPosition.symbol);
                toast.success(
                  <ToastContent title={t('pages.trade.positions-table.toasts.submit-close.title')} bodyLines={[]} />
                );
              })
              .catch((error) => {
                console.error(error);
                let msg = (error?.message ?? error) as string;
                msg = msg.length > 30 ? `${msg.slice(0, 25)}...` : msg;
                toast.error(
                  <ToastContent
                    title={t('pages.trade.positions-table.toasts.error-processing.title')}
                    bodyLines={[{ label: t('pages.trade.positions-table.toasts.error-processing.body'), value: msg }]}
                  />
                );
              })
              .finally(() => {
                setRequestSent(false);
                requestSentRef.current = false;
                closeModal();
              });
          });
        }
      })
      .catch((error) => {
        console.error(error);
        setRequestSent(false);
        requestSentRef.current = false;
      });

    if (closeOpenOrders) {
      const ordersToCancel: OrderWithIdI[] = [];
      if (selectedPosition.takeProfit.orders.length > 0) {
        ordersToCancel.push(...selectedPosition.takeProfit.orders);
      }
      if (selectedPosition.stopLoss.orders.length > 0) {
        ordersToCancel.push(...selectedPosition.stopLoss.orders);
      }

      await cancelOrders({
        ordersToCancel,
        chainId,
        chain,
        traderAPI,
        tradingClient,
        toastTitle: t('pages.trade.orders-table.toasts.cancel-order.title'),
        callback: () => {
          setLatestOrderSentTimestamp(Date.now());
        },
      });
    }
  };

  useEffect(() => {
    setCloseOpenOrders(true);
  }, [selectedPosition]);

  const hasTpSl =
    selectedPosition && (selectedPosition.stopLoss.orders.length > 0 || selectedPosition.takeProfit.orders.length > 0);

  return (
    <Dialog open={isOpen} className={styles.root}>
      <DialogTitle>{t('pages.trade.positions-table.modify-modal.close')}</DialogTitle>
      <Separator />
      <DialogContent>
        <Box className={styles.newPositionHeader}>
          <Typography variant="bodyMedium" className={styles.centered}>
            {t('pages.trade.positions-table.modify-modal.pos-details.title')}
          </Typography>
        </Box>
        <Box className={styles.newPositionDetails}>
          <SidesRow leftSide={t('pages.trade.positions-table.modify-modal.pos-details.size')} rightSide={0} />
          <SidesRow leftSide={t('pages.trade.positions-table.modify-modal.pos-details.margin')} rightSide={0} />
          <SidesRow leftSide={t('pages.trade.positions-table.modify-modal.pos-details.leverage')} rightSide="-" />
          <SidesRow leftSide={t('pages.trade.positions-table.modify-modal.pos-details.liq-price')} rightSide="-" />
        </Box>
      </DialogContent>
      {hasTpSl && (
        <>
          <Separator />
          <DialogContent>
            <Box className={styles.actionBlock} onClick={() => setCloseOpenOrders((prev) => !prev)}>
              <SidesRow
                leftSide={t('pages.trade.positions-table.modify-modal.pos-details.close-tp-sl')}
                rightSide={<Checkbox checked={closeOpenOrders} className={styles.checkbox} />}
              />
            </Box>
          </DialogContent>
        </>
      )}
      <Separator />
      <DialogActions>
        <Button onClick={closeModal} variant="secondary" size="small">
          {t('pages.trade.positions-table.modify-modal.cancel')}
        </Button>
        <Button onClick={handleClosePositionConfirm} variant="primary" size="small" disabled={requestSent}>
          {t('pages.trade.positions-table.modify-modal.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
