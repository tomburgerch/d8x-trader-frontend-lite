import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { Provider as JotaiProvider } from 'jotai';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';

import { chains, wagmiClient } from 'blockchain-api/wagmi/wagmiClient';
import { CandlesWebSocketContextProvider } from 'context/websocket-context/candles/CandlesWebSocketContextProvider';
import { WebSocketContextProvider } from 'context/websocket-context/d8x/WebSocketContextProvider';
import { theme } from 'styles/theme/theme';

import { App } from './App';

import 'react-toastify/dist/ReactToastify.css';
import './styles/index.scss';
import { Disclaimer } from 'components/disclaimer/disclaimer';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);

  root.render(
    <StrictMode>
      <JotaiProvider>
        <WebSocketContextProvider>
          <CandlesWebSocketContextProvider>
            <WagmiConfig client={wagmiClient}>
              <RainbowKitProvider
                chains={chains}
                initialChain={80001}
                appInfo={{ appName: 'D8X', disclaimer: Disclaimer, learnMoreUrl: 'https://d8x.exchange/' }}
                modalSize="compact"
              >
                <StyledEngineProvider injectFirst>
                  <ThemeProvider theme={theme}>
                    <BrowserRouter>
                      <App />
                    </BrowserRouter>
                  </ThemeProvider>
                </StyledEngineProvider>
              </RainbowKitProvider>
            </WagmiConfig>
          </CandlesWebSocketContextProvider>
        </WebSocketContextProvider>
      </JotaiProvider>
    </StrictMode>
  );
}
