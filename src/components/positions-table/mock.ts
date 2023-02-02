interface PositionI {
  id: number;
  symbol: string;
  positionSize: number;
  entryPrice: number;
  liqPrice: number;
  margin: number;
  unrealizedPnl: number;
}

export const MOCK_POSITIONS: PositionI[] = [
  {
    id: 1,
    symbol: 'BTC/USD',
    positionSize: 3520,
    entryPrice: 2445,
    liqPrice: 3400,
    margin: 400,
    unrealizedPnl: 1723,
  },
  {
    id: 2,
    symbol: 'BTC/USD',
    positionSize: 12100,
    entryPrice: 2445,
    liqPrice: 1000,
    margin: 200,
    unrealizedPnl: 1022,
  },
  {
    id: 3,
    symbol: 'BTC/USD',
    positionSize: 256,
    entryPrice: 244425,
    liqPrice: 1200,
    margin: 210,
    unrealizedPnl: 2411,
  },
];
