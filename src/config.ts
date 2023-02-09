const { REACT_APP_API_URL: apiUrl = '', REACT_APP_WEBSOCKET_URL: wsUrl = '' } = process.env;

export const config = {
  apiUrl,
  wsUrl,
};
