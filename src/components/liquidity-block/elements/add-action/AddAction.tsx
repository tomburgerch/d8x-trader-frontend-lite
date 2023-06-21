import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useSigner } from 'wagmi';

import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { approveMarginToken } from 'blockchain-api/approveMarginToken';
import { InfoBlock } from 'components/info-block/InfoBlock';
import { Separator } from 'components/separator/Separator';
import { ToastContent } from 'components/toast-content/ToastContent';
import { dCurrencyPriceAtom, liqProvToolAtom, selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';
import { proxyAddrAtom } from 'store/pools.store';
import { toUtf8String } from '@ethersproject/strings';
import styles from './AddAction.module.scss';

export const AddAction = memo(() => {
  const { address } = useAccount();

  const { data: signer } = useSigner({
    onError(error) {
      console.log(error);
    },
  });

  const [proxyAddr] = useAtom(proxyAddrAtom);
  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);
  const [liqProvTool] = useAtom(liqProvToolAtom);
  const [dCurrencyPrice] = useAtom(dCurrencyPriceAtom);

  const [addAmount, setAddAmount] = useState(0);
  const [requestSent, setRequestSent] = useState(false);

  const [inputValue, setInputValue] = useState(`${addAmount}`);

  const requestSentRef = useRef(false);
  const signerRef = useRef(signer);
  const inputValueChangedRef = useRef(false);

  const handleInputCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const targetValue = event.target.value;
    if (targetValue) {
      setAddAmount(+targetValue);
      setInputValue(targetValue);
    } else {
      setAddAmount(0);
      setInputValue('');
    }
    inputValueChangedRef.current = true;
  }, []);

  useEffect(() => {
    if (!inputValueChangedRef.current) {
      setInputValue(`${addAmount}`);
    }
    inputValueChangedRef.current = false;
  }, [addAmount]);

  const handleAddLiquidity = useCallback(() => {
    if (requestSentRef.current) {
      return;
    }

    if (!liqProvTool || !selectedLiquidityPool || !addAmount || addAmount < 0) {
      return;
    }

    if (!address || !signer || !proxyAddr) {
      return;
    }

    requestSentRef.current = true;
    setRequestSent(true);

    approveMarginToken(signer, selectedLiquidityPool.marginTokenAddr, proxyAddr, addAmount)
      .then((res) => {
        if (res?.hash) {
          console.log(res.hash);
        }
        liqProvTool.addLiquidity(selectedLiquidityPool.poolSymbol, addAmount).then(async (tx) => {
          console.log(`addLiquidity tx hash: ${tx.hash}`);
          const receipt = await tx.wait();
          if (receipt.status === 1) {
            setAddAmount(0);
            setInputValue('0');
            toast.success(<ToastContent title="Liquidity added" bodyLines={[]} />);
            // TODO: run data re-fetch
          } else {
            let reason: string;
            if (signerRef.current) {
              const response = await signerRef.current.call(
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
              reason = toUtf8String('0x' + response.substring(138));
            } else {
              reason = 'unknown';
            }
            toast.error(
              <ToastContent title="Error adding liquidity" bodyLines={[{ label: 'reason', value: reason }]} />
            );
          }
        });
      })
      .catch(() => {})
      .finally(() => {
        requestSentRef.current = false;
        setRequestSent(false);
      });
  }, [addAmount, liqProvTool, selectedLiquidityPool, address, proxyAddr, signer]);

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
          value={inputValue}
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
