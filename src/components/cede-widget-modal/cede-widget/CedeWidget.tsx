import { renderSendWidget } from '@cedelabs/widgets-universal';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

import { enabledDarkModeAtom } from 'store/app.store';
import { modalSelectedCurrencyAtom } from 'store/global-modals.store';
import { TemporaryAnyT } from 'types/types';

const CEDE_WIDGET_ID = 'cede-widget';

export const CedeWidget = () => {
  const selectedCurrency = useAtomValue(modalSelectedCurrencyAtom);
  const enabledDarkMode = useAtomValue(enabledDarkModeAtom);

  const { address, chain } = useAccount();

  useEffect(() => {
    setTimeout(() => {
      const widgetTheme: TemporaryAnyT = {
        mode: enabledDarkMode ? 'dark' : 'light',
        logoTheme: enabledDarkMode ? 'dark' : 'light',
      };

      const widgetConfig: TemporaryAnyT = {
        tokenSymbol: selectedCurrency?.name,
        network: chain?.name,
        address: address, // destination address
        lockNetwork: false,
        // limit exchanges to those supporting app token/network if needed
        // exchangeIds: ['binance', 'coinbase', 'bybit', 'kraken', 'bingx'],
      };

      renderSendWidget(`#${CEDE_WIDGET_ID}`, { config: widgetConfig, theme: widgetTheme }).then();
    });
  }, [selectedCurrency, address, chain, enabledDarkMode]);

  return <div id={CEDE_WIDGET_ID}></div>;
};
