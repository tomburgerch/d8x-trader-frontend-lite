import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { type Address, formatUnits, parseEther } from 'viem';
import {
  BaseError,
  useAccount,
  useBalance,
  useEstimateGas,
  useGasPrice,
  useSendTransaction,
  useWalletClient,
} from 'wagmi';

import { Button, CircularProgress, Link, Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import { ResponsiveInput } from 'components/responsive-input/ResponsiveInput';
import { ToastContent } from 'components/toast-content/ToastContent';
import { valueToFractionDigits } from 'utils/formatToCurrency';

import { useFundingTransfer } from './hooks/useFundingTransfer';

import styles from './FundingModal.module.scss';

interface FundingModalPropsI {
  isOpen: boolean;
  delegateAddress: Address;
  onClose: () => void;
}

export const FundingModal = ({ isOpen, onClose, delegateAddress }: FundingModalPropsI) => {
  const { t } = useTranslation();

  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();
  const { data: sendHash, error: sendError, isPending, sendTransaction } = useSendTransaction();

  const [inputValue, setInputValue] = useState('');

  const { data: gasTokenBalance, refetch } = useBalance({
    address,
    query: {
      enabled: address && isConnected,
    },
  });

  const { data: delegateBalance } = useBalance({
    address: delegateAddress,
  });

  const { isFetched, setTxHash } = useFundingTransfer(inputValue, delegateBalance?.symbol);

  useEffect(() => {
    setTxHash(sendHash);
  }, [sendHash, setTxHash]);

  useEffect(() => {
    if (sendError) {
      console.error(sendError);
      toast.error(<ToastContent title={(sendError as BaseError).shortMessage || sendError.message} bodyLines={[]} />);
    }
  }, [sendError]);

  useEffect(() => {
    if (!isPending) {
      setInputValue('');
      refetch();
    }
  }, [isPending, refetch]);

  useEffect(() => {
    if (isFetched) {
      onClose();
      refetch();
    }
  }, [isFetched, onClose, refetch]);

  const { data: estimatedGas } = useEstimateGas({
    account: walletClient?.account,
    chainId: walletClient?.chain.id,
    to: delegateAddress,
    value: 1n,
  });

  const { data: gasPrice } = useGasPrice({ chainId: walletClient?.chain.id });

  const roundedGasTokenBalance = useMemo(() => {
    if (gasTokenBalance && estimatedGas && gasPrice) {
      const parsedGasTokenBalance = parseFloat(formatUnits(gasTokenBalance.value, gasTokenBalance.decimals));
      const parsedGasFee = parseFloat(formatUnits((estimatedGas * gasPrice * 110n) / 100n, gasTokenBalance.decimals));
      const fractionDigitsGasTokenBalance = valueToFractionDigits(parsedGasTokenBalance);
      return (parsedGasTokenBalance - parsedGasFee).toFixed(fractionDigitsGasTokenBalance);
    }
    return '';
  }, [gasTokenBalance, estimatedGas, gasPrice]);

  const handleMaxGas = () => {
    if (gasTokenBalance) {
      setInputValue(roundedGasTokenBalance);
    } else {
      setInputValue('');
    }
  };

  const handleTransferFunds = useCallback(() => {
    if (!walletClient || !inputValue) {
      return;
    }

    sendTransaction({
      account: walletClient.account,
      to: delegateAddress,
      value: parseEther(inputValue),
    });
  }, [walletClient, delegateAddress, inputValue, sendTransaction]);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className={styles.dialogContent}>
        <div className={styles.dialogContent}>
          <Typography variant="h4" className={styles.title}>
            {t(`common.settings.one-click-modal.funding-modal.title`)}
          </Typography>
          <Typography variant="bodySmallPopup" className={styles.title}>
            {t(`common.settings.one-click-modal.funding-modal.description`)}
          </Typography>
          <div className={styles.inputWrapper}>
            <ResponsiveInput
              id="fund-amount"
              className={styles.inputHolder}
              inputClassName={styles.inputClassName}
              inputValue={inputValue}
              setInputValue={setInputValue}
              currency={delegateBalance?.symbol}
              min={0}
              max={+roundedGasTokenBalance}
            />
            {roundedGasTokenBalance && (
              <Typography className={styles.helperText} variant="bodyTiny">
                {t('common.max')} <Link onClick={handleMaxGas}>{roundedGasTokenBalance}</Link>
              </Typography>
            )}
          </div>
        </div>
        <div className={styles.buttonsBlock}>
          <Button variant="secondary" className={styles.cancelButton} onClick={onClose}>
            {t('pages.refer.trader-tab.cancel')}
          </Button>
          <Button
            variant="primary"
            className={styles.actionButton}
            onClick={handleTransferFunds}
            disabled={isPending || !inputValue || +inputValue === 0}
          >
            {isPending && <CircularProgress size="24px" sx={{ mr: 2 }} />}
            {t(`common.settings.one-click-modal.funding-modal.fund`)}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
