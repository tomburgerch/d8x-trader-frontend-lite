import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { PERIOD_OF_2_DAYS } from 'app-constants';
import { InfoBlock } from 'components/info-block/InfoBlock';
import { ToastContent } from 'components/toast-content/ToastContent';
import { Separator } from 'components/separator/Separator';
import { dCurrencyPriceAtom, liqProvToolAtom, selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './InitiateAction.module.scss';

export const InitiateAction = memo(() => {
  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);
  const [liqProvTool] = useAtom(liqProvToolAtom);
  const [dCurrencyPrice] = useAtom(dCurrencyPriceAtom);

  const [initiateAmount, setInitiateAmount] = useState(0);
  const [requestSent, setRequestSent] = useState(false);

  const [inputValue, setInputValue] = useState(`${initiateAmount}`);

  const requestSentRef = useRef(false);

  const inputValueChangedRef = useRef(false);

  const handleInputCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const targetValue = event.target.value;
    if (targetValue) {
      setInitiateAmount(+targetValue);
      setInputValue(targetValue);
    } else {
      setInitiateAmount(0);
      setInputValue('');
    }
    inputValueChangedRef.current = true;
  }, []);

  useEffect(() => {
    if (!inputValueChangedRef.current) {
      setInputValue(`${initiateAmount}`);
    }
    inputValueChangedRef.current = false;
  }, [initiateAmount]);

  const handleInitiateLiquidity = useCallback(() => {
    if (requestSentRef.current) {
      return;
    }

    if (!liqProvTool || !selectedLiquidityPool || !initiateAmount || initiateAmount < 0) {
      return;
    }

    requestSentRef.current = true;
    setRequestSent(true);

    liqProvTool
      .initiateLiquidityWithdrawal(selectedLiquidityPool.poolSymbol, initiateAmount)
      .then(async (result) => {
        const receipt = await result.wait();
        if (receipt.status === 1) {
          toast.success(<ToastContent title="Liquidity withdrawal initiated" bodyLines={[]} />);
          // TODO: run data re-fetch
        } else {
          toast.error(<ToastContent title="Error initiating liquidity withdrawal" bodyLines={[]} />);
        }
      })
      .catch(() => {})
      .finally(() => {
        requestSentRef.current = false;
        setRequestSent(false);
      });
  }, [initiateAmount, liqProvTool, selectedLiquidityPool]);

  const predictedAmount = useMemo(() => {
    if (initiateAmount > 0 && dCurrencyPrice != null) {
      return initiateAmount * dCurrencyPrice;
    }
    return 0;
  }, [initiateAmount, dCurrencyPrice]);

  return (
    <div className={styles.root}>
      <Separator />
      <Box className={styles.inputLine}>
        <Box className={styles.label}>
          <InfoBlock
            title="Amount"
            content={
              <>
                <Typography>Some text goes here for Initiate Amount.</Typography>
                <Typography>More text goes here...</Typography>
              </>
            }
          />
        </Box>
        <OutlinedInput
          id="initiate-amount-size"
          endAdornment={
            <InputAdornment position="end">
              <Typography variant="adornment">{`d${selectedLiquidityPool?.poolSymbol}`}</Typography>
            </InputAdornment>
          }
          type="number"
          inputProps={{ step: 1, min: 0 }}
          value={inputValue}
          onChange={handleInputCapture}
        />
      </Box>
      <Separator />
      <Box className={styles.infoBlock}>
        <Box className={styles.row}>
          <Typography variant="body2">Amount</Typography>
          <Typography variant="body2">
            {formatToCurrency(predictedAmount, selectedLiquidityPool?.poolSymbol)}
          </Typography>
        </Box>
        <Box className={styles.row}>
          <Typography variant="body2">Can be withdrawn on:</Typography>
          <Typography variant="body2">
            {format(new Date(Date.now() + PERIOD_OF_2_DAYS), 'MMMM d yyyy HH:mm')}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="primary"
        disabled={!initiateAmount || requestSent}
        onClick={handleInitiateLiquidity}
        className={styles.actionButton}
      >
        Initiate withdrawal
      </Button>
    </div>
  );
});
