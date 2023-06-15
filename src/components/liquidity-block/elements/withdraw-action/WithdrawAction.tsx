import { useAtom } from 'jotai';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Box, Button, Typography } from '@mui/material';

import { PERIOD_OF_2_DAYS, PERIOD_OF_4_DAYS } from 'app-constants';
import { InfoBlock } from 'components/info-block/InfoBlock';
import { Separator } from 'components/separator/Separator';
import { ToastContent } from 'components/toast-content/ToastContent';
import {
  dCurrencyPriceAtom,
  liqProvToolAtom,
  selectedLiquidityPoolAtom,
  userAmountAtom,
  withdrawalsAtom,
} from 'store/liquidity-pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './WithdrawAction.module.scss';

export const WithdrawAction = memo(() => {
  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);
  const [liqProvTool] = useAtom(liqProvToolAtom);
  const [dCurrencyPrice] = useAtom(dCurrencyPriceAtom);
  const [userAmount] = useAtom(userAmountAtom);
  const [withdrawals] = useAtom(withdrawalsAtom);

  const [requestSent, setRequestSent] = useState(false);

  const requestSentRef = useRef(false);

  const handleWithdrawLiquidity = useCallback(() => {
    if (requestSentRef.current) {
      return;
    }

    if (!liqProvTool || !selectedLiquidityPool) {
      return;
    }

    requestSentRef.current = true;
    setRequestSent(true);

    liqProvTool
      .executeLiquidityWithdrawal(selectedLiquidityPool.poolSymbol)
      .then(async (result) => {
        const receipt = await result.wait();
        if (receipt.status === 1) {
          toast.success(<ToastContent title="Liquidity withdrawn" bodyLines={[]} />);
          // TODO: run data re-fetch
        } else {
          toast.error(<ToastContent title="Error executing withdrawal" bodyLines={[]} />);
        }
      })
      .catch(() => {})
      .finally(() => {
        requestSentRef.current = false;
        setRequestSent(false);
      });
  }, [liqProvTool, selectedLiquidityPool]);

  const shareAmount = useMemo(() => {
    if (withdrawals.length === 0) {
      return 0;
    }
    const currentTime = Date.now();
    const latestWithdrawal = withdrawals[withdrawals.length - 1];
    const latestWithdrawalTimeElapsed = latestWithdrawal.timeElapsedSec * 1000;

    const withdrawalTime = currentTime + PERIOD_OF_2_DAYS - latestWithdrawalTimeElapsed;
    if (currentTime < withdrawalTime) {
      return 0;
    } else if (currentTime >= withdrawalTime + PERIOD_OF_4_DAYS) {
      return 0;
    } else {
      // (currentTime >= withdrawalTime)
      return latestWithdrawal.shareAmount;
    }
  }, [withdrawals]);

  const predictedAmount = useMemo(() => {
    if (userAmount && userAmount > 0 && dCurrencyPrice != null) {
      return userAmount * dCurrencyPrice;
    }
    return 0;
  }, [userAmount, dCurrencyPrice]);

  return (
    <div className={styles.root}>
      <Separator />
      <Box className={styles.inputLine}>
        <Box className={styles.label}>
          <InfoBlock
            title="Withdrawable amount"
            content={
              <>
                <Typography>Some text goes here for Withdrawable Amount.</Typography>
                <Typography>More text goes here...</Typography>
              </>
            }
          />
        </Box>
        <Typography variant="body1" className={styles.value}>
          {formatToCurrency(shareAmount, selectedLiquidityPool?.poolSymbol)}
        </Typography>
      </Box>
      <Box className={styles.inputLine}>
        <Box className={styles.label}>
          <InfoBlock
            title="dMATIC price"
            content={
              <>
                <Typography>Some text goes here for d{selectedLiquidityPool?.poolSymbol} price.</Typography>
                <Typography>More text goes here...</Typography>
              </>
            }
          />
        </Box>
        <Typography variant="body1" className={styles.value}>
          {formatToCurrency(dCurrencyPrice, selectedLiquidityPool?.poolSymbol)}
        </Typography>
      </Box>
      <Separator />
      <Box className={styles.infoBlock}>
        <Box className={styles.row}>
          <Typography variant="body2">You receive:</Typography>
          <Typography variant="body2">
            {formatToCurrency(predictedAmount, selectedLiquidityPool?.poolSymbol)}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="primary"
        onClick={handleWithdrawLiquidity}
        className={styles.actionButton}
        disabled={shareAmount > 0 && requestSent}
      >
        Withdraw
      </Button>
    </div>
  );
});
