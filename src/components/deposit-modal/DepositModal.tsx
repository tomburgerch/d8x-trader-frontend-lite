import classNames from 'classnames';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import { CopyInput } from 'components/copy-input/CopyInput';
import { CopyLink } from 'components/copy-link/CopyLink';
import { CurrencySelect } from 'components/currency-selector/CurrencySelect';
import { Dialog } from 'components/dialog/Dialog';
import { Separator } from 'components/separator/Separator';
import { Translate } from 'components/translate/Translate';
import { WalletBalances } from 'components/wallet-balances/WalletBalances';
import { isCedeWidgetEnabled } from 'helpers/isCedeWidgetEnabled';
import { isLifiWidgetEnabled } from 'helpers/isLifiWidgetEnabled';
import { isOwltoButtonEnabled } from 'helpers/isOwltoButtonEnabled';
import { useBridgeShownOnPage } from 'helpers/useBridgeShownOnPage';
import { activatedOneClickTradingAtom, tradingClientAtom } from 'store/app.store';
import { depositModalOpenAtom, modalSelectedCurrencyAtom } from 'store/global-modals.store';
import { gasTokenSymbolAtom } from 'store/pools.store';
import { cutAddress } from 'utils/cutAddress';
import { isEnabledChain } from 'utils/isEnabledChain';

import { CedeWidgetButton } from './elements/cede-widget-button/CedeWidgetButton';
import { LiFiWidgetButton } from './elements/lifi-widget-button/LiFiWidgetButton';
import { OKXConvertor } from './elements/okx-convertor/OKXConvertor';
import { OwltoButton } from './elements/owlto-button/OwltoButton';

import styles from './DepositModal.module.scss';

export const DepositModal = () => {
  const { t } = useTranslation();

  const { address, chain, chainId } = useAccount();

  const [isDepositModalOpen, setDepositModalOpen] = useAtom(depositModalOpenAtom);
  const selectedCurrency = useAtomValue(modalSelectedCurrencyAtom);
  const gasTokenSymbol = useAtomValue(gasTokenSymbolAtom);
  const tradingClient = useAtomValue(tradingClientAtom);
  const activatedOneClickTrading = useAtomValue(activatedOneClickTradingAtom);

  const isBridgeShownOnPage = useBridgeShownOnPage();
  const isOwltoEnabled = isOwltoButtonEnabled(chainId);
  const isLiFiEnabled = isLifiWidgetEnabled(isOwltoEnabled, chainId);
  const isCedeEnabled = isCedeWidgetEnabled(chainId);

  const targetAddress = useMemo(() => {
    if (activatedOneClickTrading && selectedCurrency?.isGasToken === false) {
      return address;
    }
    return tradingClient?.account?.address;
  }, [tradingClient?.account?.address, address, activatedOneClickTrading, selectedCurrency]);

  const handleOnClose = useCallback(() => {
    setDepositModalOpen(false);
  }, [setDepositModalOpen]);

  const poolAddress = selectedCurrency?.contractAddress || '';

  if (!isEnabledChain(chainId)) {
    return null;
  }

  return (
    <Dialog open={isDepositModalOpen} onClose={handleOnClose} className={styles.dialog}>
      <DialogTitle>{t('common.deposit-modal.title')}</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <div className={styles.section}>
          <CurrencySelect />
        </div>
        <Separator />
        <OKXConvertor />
        <div className={styles.section}>
          {activatedOneClickTrading ? (
            <Typography variant="bodyMedium" className={styles.noteText}>
              {t('common.deposit-modal.important-notice.0')}
            </Typography>
          ) : (
            <div>{/* empty block */}</div>
          )}
          <Typography variant="bodySmall" className={styles.noteText}>
            <Translate
              i18nKey="common.deposit-modal.important-notice.1"
              values={{ currencyName: selectedCurrency?.settleToken }}
            />{' '}
            {poolAddress && (
              <>
                {t('common.deposit-modal.important-notice.2')}
                <CopyLink
                  elementToShow={cutAddress(poolAddress)}
                  textToCopy={poolAddress}
                  classname={styles.copyText}
                />
                {t('common.deposit-modal.important-notice.3')}{' '}
              </>
            )}
            {t('common.deposit-modal.important-notice.4')}{' '}
            <Translate i18nKey="common.deposit-modal.important-notice.5" values={{ chainName: chain?.name }} />
          </Typography>
        </div>
        <div className={styles.section}>
          <CopyInput id="address" textToCopy={targetAddress || ''} />
        </div>
        {(isCedeEnabled || isLiFiEnabled || isOwltoEnabled) && (
          <div className={classNames(styles.section, styles.widgetButtons)}>
            {isBridgeShownOnPage && (isLiFiEnabled || isOwltoEnabled) ? (
              <div>
                {isLiFiEnabled && <LiFiWidgetButton />}
                {isOwltoEnabled && <OwltoButton />}
              </div>
            ) : (
              <div>{/* empty block */}</div>
            )}
            {isCedeEnabled ? <CedeWidgetButton /> : <div>{/* empty block */}</div>}
          </div>
        )}
        <Separator />
        <div className={styles.section}>
          <WalletBalances />
          <Typography variant="bodyTiny" className={styles.noteText}>
            <Translate i18nKey="common.deposit-modal.deposit-note" values={{ currencyName: gasTokenSymbol }} />
          </Typography>
        </div>
      </DialogContent>
      <DialogActions className={styles.dialogAction}>
        <Button onClick={handleOnClose} variant="secondary">
          {t('common.deposit-modal.done-button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
