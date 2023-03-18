const {
  REACT_APP_API_URL: apiUrl = '',
  REACT_APP_WEBSOCKET_URL: wsUrl = '',
  REACT_APP_CANDLES_WEBSOCKET_URL: candlesWsUrl = '',
} = process.env;

export const config = {
  apiUrl,
  wsUrl,
  candlesWsUrl,
};
