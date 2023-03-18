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

import './styles/index.scss';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);

  root.render(
    <StrictMode>
      <JotaiProvider>
        <WebSocketContextProvider>
          <CandlesWebSocketContextProvider>
            <WagmiConfig client={wagmiClient}>
              <RainbowKitProvider chains={chains} modalSize="compact">
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
