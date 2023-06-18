import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { Separator } from 'components/separator/Separator';
import { ToastContent } from 'components/toast-content/ToastContent';
import { dCurrencyPriceAtom, liqProvToolAtom, selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './AddAction.module.scss';

export const AddAction = memo(() => {
  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);
  const [liqProvTool] = useAtom(liqProvToolAtom);
  const [dCurrencyPrice] = useAtom(dCurrencyPriceAtom);

  const [addAmount, setAddAmount] = useState(0);
  const [requestSent, setRequestSent] = useState(false);

  const requestSentRef = useRef(false);

  const handleInputCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddAmount(+event.target.value);
  }, []);

  const handleAddLiquidity = useCallback(() => {
    if (requestSentRef.current) {
      return;
    }

    if (!liqProvTool || !selectedLiquidityPool || !addAmount || addAmount < 0) {
      return;
    }

    requestSentRef.current = true;
    setRequestSent(true);

    liqProvTool
      .addLiquidity(selectedLiquidityPool.poolSymbol, addAmount)
      .then(async (result) => {
        const receipt = await result.wait();
        if (receipt.status === 1) {
          toast.success(<ToastContent title="Liquidity added" bodyLines={[]} />);
          // TODO: run data re-fetch
        } else {
          toast.error(<ToastContent title="Error adding liquidity" bodyLines={[]} />);
        }
      })
      .catch(() => {})
      .finally(() => {
        requestSentRef.current = false;
        setRequestSent(false);
      });
  }, [addAmount, liqProvTool, selectedLiquidityPool]);

  const predictedAmount = useMemo(() => {
    if (addAmount > 0 && dCurrencyPrice != null) {
      return addAmount / dCurrencyPrice;
    }
    return 0;
  }, [addAmount, dCurrencyPrice]);

  return (
    <div className={styles.root}>
      <Separator />
      <Box className={styles.inputLine}>
        <Box className={styles.label}>
          <InfoBlock
            title="Amount"
            content={
              <>
                <Typography>Some text goes here for Add Amount.</Typography>
                <Typography>More text goes here...</Typography>
              </>
            }
          />
        </Box>
        <OutlinedInput
          id="initiate-amount-size"
          endAdornment={
            <InputAdornment position="end">
              <Typography variant="adornment">{selectedLiquidityPool?.poolSymbol}</Typography>
            </InputAdornment>
          }
          type="number"
          inputProps={{ step: 1, min: 0 }}
          value={addAmount}
          onChange={handleInputCapture}
        />
      </Box>
      <Separator />
      <Box className={styles.infoBlock}>
        <Box className={styles.row}>
          <Typography variant="body2">You receive:</Typography>
          <Typography variant="body2">
            {formatToCurrency(predictedAmount, `d${selectedLiquidityPool?.poolSymbol}`)}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="primary"
        disabled={!addAmount || requestSent}
        onClick={handleAddLiquidity}
        className={styles.actionButton}
      >
        Add
      </Button>
    </div>
  );
});
