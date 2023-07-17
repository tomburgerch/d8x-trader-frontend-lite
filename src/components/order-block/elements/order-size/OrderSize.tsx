import { roundToLotString } from '@d8x/perpetuals-sdk';
import { useAtom } from 'jotai';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { ResponsiveInput } from 'components/responsive-input/ResponsiveInput';

import { orderBlockAtom, orderSizeAtom } from 'store/order-block.store';
import { perpetualStaticInfoAtom, selectedPerpetualAtom, traderAPIAtom } from 'store/pools.store';

import styles from './OrderSize.module.scss';
import { useAccount, useChainId } from 'wagmi';
import { getMaxOrderSizeForTrader } from 'network/network';
import { OrderBlockE } from 'types/enums';
import { sdkConnectedAtom } from 'store/vault-pools.store';

export const OrderSize = memo(() => {
  const [orderSize, setOrderSize] = useAtom(orderSizeAtom);
  const [perpetualStaticInfo] = useAtom(perpetualStaticInfoAtom);
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [orderBlock] = useAtom(orderBlockAtom);
  const [isSDKConnected] = useAtom(sdkConnectedAtom);

  const [inputValue, setInputValue] = useState(`${orderSize}`);
  const [maxOrderSize, setMaxOrderSize] = useState<number | undefined>(undefined);

  const { address } = useAccount();
  const chainId = useChainId();

  const inputValueChangedRef = useRef(false);
  const traderAPIRef = useRef(traderAPI);

  const handleOrderSizeChange = useCallback(
    (orderSizeValue: string) => {
      if (orderSizeValue) {
        setOrderSize(+orderSizeValue);
        setInputValue(orderSizeValue);
      } else {
        setOrderSize(0);
        setInputValue('');
      }
      inputValueChangedRef.current = true;
    },
    [setOrderSize]
  );

  useEffect(() => {
    if (!inputValueChangedRef.current) {
      setInputValue(`${orderSize}`);
    }
    inputValueChangedRef.current = false;
  }, [orderSize]);

  const handleInputBlur = useCallback(() => {
    if (perpetualStaticInfo) {
      const roundedValue = roundToLotString(orderSize, perpetualStaticInfo.lotSizeBC);
      setOrderSize(+roundedValue);
      setInputValue(roundedValue);
    }
  }, [perpetualStaticInfo, orderSize, setOrderSize]);

  const orderSizeStep = useMemo(() => {
    if (perpetualStaticInfo) {
      return roundToLotString(perpetualStaticInfo.lotSizeBC, perpetualStaticInfo.lotSizeBC);
    }
    return '0.1';
  }, [perpetualStaticInfo]);

  const minPositionString = useMemo(() => {
    if (perpetualStaticInfo) {
      return roundToLotString(10 * perpetualStaticInfo.lotSizeBC, perpetualStaticInfo.lotSizeBC);
    }
    return '0.1';
  }, [perpetualStaticInfo]);

  useEffect(() => {
    if (perpetualStaticInfo && address && traderAPIRef.current && isSDKConnected) {
      const symbol = traderAPIRef.current.getSymbolFromPerpId(perpetualStaticInfo.id);
      if (!symbol) {
        return;
      }
      getMaxOrderSizeForTrader(chainId, traderAPIRef.current, address, symbol).then((data) => {
        let maxAmount: number;
        if (orderBlock === OrderBlockE.Long) {
          maxAmount = data.data.buy;
        } else {
          maxAmount = data.data.sell;
        }
        maxAmount = +roundToLotString(maxAmount, perpetualStaticInfo.lotSizeBC);
        setMaxOrderSize(maxAmount);
      });
    }
  }, [isSDKConnected, chainId, address, perpetualStaticInfo, orderBlock]);

  useEffect(() => {
    if (isSDKConnected) {
      traderAPIRef.current = traderAPI;
    }
  }, [traderAPI, isSDKConnected]);

  return (
    <Box className={styles.root}>
      <Box className={styles.label}>
        <InfoBlock
          title={'Order size'}
          content={
            <>
              <Typography> Sets the size of your order. </Typography>
              <Typography>
                Your maximal order size, based on your open positions and the state of the exchange, is {maxOrderSize}{' '}
                {selectedPerpetual?.baseCurrency}. The minimal position size for this perpetual is {minPositionString}{' '}
                {selectedPerpetual?.baseCurrency}, with a step size of {orderSizeStep} {selectedPerpetual?.baseCurrency}
                .
              </Typography>
            </>
          }
        />
      </Box>
      <ResponsiveInput
        id="order-size"
        inputValue={inputValue}
        setInputValue={handleOrderSizeChange}
        handleInputBlur={handleInputBlur}
        currency={selectedPerpetual?.baseCurrency}
        step={orderSizeStep}
        min={0}
        max={maxOrderSize}
      />
    </Box>
  );
});
