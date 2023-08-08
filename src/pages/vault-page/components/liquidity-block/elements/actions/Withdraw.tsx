import { toUtf8String } from '@ethersproject/strings';
import { useAtom } from 'jotai';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useSigner } from 'wagmi';

import { Box, Button, Typography } from '@mui/material';

import { PERIOD_OF_2_DAYS } from 'app-constants';
import { InfoBlock } from 'components/info-block/InfoBlock';
import { Separator } from 'components/separator/Separator';
import { ToastContent } from 'components/toast-content/ToastContent';
import { Initiate } from './Initiate';

import { selectedPoolAtom, traderAPIAtom } from 'store/pools.store';
import {
  dCurrencyPriceAtom,
  triggerUserStatsUpdateAtom,
  triggerWithdrawalsUpdateAtom,
  userAmountAtom,
  withdrawalsAtom,
} from 'store/vault-pools.store';

import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './Action.module.scss';

interface WithdrawPropsI {
  withdrawOn: string;
}

export const Withdraw = memo(({ withdrawOn }: WithdrawPropsI) => {
  const { t } = useTranslation();
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [liqProvTool] = useAtom(traderAPIAtom);
  const [dCurrencyPrice] = useAtom(dCurrencyPriceAtom);
  const [userAmount] = useAtom(userAmountAtom);
  const [withdrawals] = useAtom(withdrawalsAtom);
  const [, setTriggerWithdrawalsUpdate] = useAtom(triggerWithdrawalsUpdateAtom);
  const [, setTriggerUserStatsUpdate] = useAtom(triggerUserStatsUpdateAtom);

  const { data: signer } = useSigner();

  const [requestSent, setRequestSent] = useState(false);

  const requestSentRef = useRef(false);

  const handleWithdrawLiquidity = useCallback(() => {
    if (requestSentRef.current) {
      return;
    }

    if (!liqProvTool || !selectedPool || !signer) {
      return;
    }

    requestSentRef.current = true;
    setRequestSent(true);

    liqProvTool
      .executeLiquidityWithdrawal(signer, selectedPool.poolSymbol)
      .then(async (tx) => {
        console.log(`executeLiquidityWithdrawal tx hash: ${tx.hash}`);
        toast.success(<ToastContent title={t('pages.vault.toast.withdrawing')} bodyLines={[]} />);
        tx.wait()
          .then((receipt) => {
            if (receipt.status === 1) {
              setTriggerUserStatsUpdate((prevValue) => !prevValue);
              setTriggerWithdrawalsUpdate((prevValue) => !prevValue);
              requestSentRef.current = false;
              setRequestSent(false);
              toast.success(<ToastContent title={t('pages.vault.toast.withdrawn')} bodyLines={[]} />);
            }
          })
          .catch(async (err) => {
            console.log(err);
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
            setTriggerUserStatsUpdate((prevValue) => !prevValue);
            setTriggerWithdrawalsUpdate((prevValue) => !prevValue);
            requestSentRef.current = false;
            setRequestSent(false);
            toast.error(
              <ToastContent
                title={t('pages.vault.toast.error.title')}
                bodyLines={[{ label: t('pages.vault.toast.error.body'), value: reason }]}
              />
            );
          });
      })
      .catch(async (err) => {
        setTriggerUserStatsUpdate((prevValue) => !prevValue);
        setTriggerWithdrawalsUpdate((prevValue) => !prevValue);
        requestSentRef.current = false;
        setRequestSent(false);
        toast.error(
          <ToastContent
            title={t('pages.vault.toast.error.title')}
            bodyLines={[{ label: t('pages.vault.toast.error.body'), value: err as string }]}
          />
        );
      });
  }, [liqProvTool, selectedPool, signer, setTriggerUserStatsUpdate, setTriggerWithdrawalsUpdate, t]);

  const shareAmount = useMemo(() => {
    if (!withdrawals) {
      return;
    }
    if (withdrawals.length === 0) {
      return 0;
    }
    const currentTime = Date.now();
    const latestWithdrawal = withdrawals[withdrawals.length - 1];
    const latestWithdrawalTimeElapsed = latestWithdrawal.timeElapsedSec * 1000;

    const withdrawalTime = currentTime + PERIOD_OF_2_DAYS - latestWithdrawalTimeElapsed;
    if (currentTime < withdrawalTime) {
      return 0;
    } else {
      return latestWithdrawal.shareAmount;
    }
  }, [withdrawals]);

  const predictedAmount = useMemo(() => {
    if (!withdrawals) {
      return;
    }
    if (withdrawals.length === 0) {
      return 0;
    }
    const latestWithdrawal = withdrawals[withdrawals.length - 1];

    if (dCurrencyPrice) {
      return latestWithdrawal.shareAmount * dCurrencyPrice;
    }
    return 0;
  }, [dCurrencyPrice, withdrawals]);

  const isButtonDisabled = useMemo(() => {
    return !userAmount || !shareAmount || requestSent;
  }, [userAmount, shareAmount, requestSent]);

  return (
    <div className={styles.root}>
      <Box className={styles.infoBlock}>
        <Typography variant="h5">{t('pages.vault.withdraw.title')}</Typography>
        <Typography variant="body2" className={styles.text}>
          {t('pages.vault.withdraw.info1')}
        </Typography>
        <Typography variant="body2" className={styles.text}>
          {t('pages.vault.withdraw.info2', { poolSymbol: selectedPool?.poolSymbol })}
        </Typography>
      </Box>
      <Box className={styles.contentBlock}>
        {!withdrawals.length && (
          <>
            <Initiate />
            <Separator className={styles.separator} />
          </>
        )}
        <Box className={styles.withdrawLabel}>
          <InfoBlock
            title={
              <>
                {!withdrawals.length && '2.'}{' '}
                {t('pages.vault.withdraw.action.title', { poolSymbol: selectedPool?.poolSymbol })}
              </>
            }
            content={
              <>
                <Typography>
                  {t('pages.vault.withdraw.action.info1', { poolSymbol: selectedPool?.poolSymbol })}
                </Typography>
              </>
            }
            classname={styles.actionIcon}
          />
        </Box>
        <Box className={styles.summaryBlock}>
          <Box className={styles.row}>
            <Typography variant="body2">{t('pages.vault.withdraw.action.date')}</Typography>
            <Typography variant="body2">
              <strong>{withdrawOn}</strong>
            </Typography>
          </Box>
          <Box className={styles.row}>
            <Typography variant="body2">{t('pages.vault.withdraw.action.receive')}</Typography>
            <Typography variant="body2">
              <strong>{formatToCurrency(predictedAmount, selectedPool?.poolSymbol)}</strong>
            </Typography>
          </Box>
        </Box>
        <Box className={styles.buttonHolder}>
          <Button
            variant="primary"
            onClick={handleWithdrawLiquidity}
            className={styles.actionButton}
            disabled={isButtonDisabled}
          >
            {t('pages.vault.withdraw.action.button')}
          </Button>
        </Box>
      </Box>
    </div>
  );
});
