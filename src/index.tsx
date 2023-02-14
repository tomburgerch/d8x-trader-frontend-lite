import { Provider as JotaiProvider } from 'jotai';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';

import { WebSocketContextProvider } from 'context/websocket-context/WebSocketContextProvider';
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
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ThemeProvider>
          </StyledEngineProvider>
        </WebSocketContextProvider>
      </JotaiProvider>
    </StrictMode>
  );
}
