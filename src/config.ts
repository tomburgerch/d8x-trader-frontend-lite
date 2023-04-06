const {
  REACT_APP_API_URL: apiUrl = '',
  REACT_APP_WEBSOCKET_URL: wsUrl = '',
  REACT_APP_CANDLES_WEBSOCKET_URL: candlesWsUrl = '',
} = process.env;

const URLS_SEPARATOR = ';';
const KEY_VALUE_SEPARATOR = '::';

function parseUrls(urlData: string): Record<string, string> {
  if (!urlData) {
    return {};
  }
  const urls: Record<string, string> = {};
  urlData.split(URLS_SEPARATOR).forEach((urlEntry) => {
    const parsedUrl = urlEntry.split(KEY_VALUE_SEPARATOR);
    urls[parsedUrl[0]] = parsedUrl[1];
  });
  return urls;
}

export const config = {
  apiUrl: parseUrls(apiUrl),
  wsUrl: parseUrls(wsUrl),
  candlesWsUrl: parseUrls(candlesWsUrl),
};
