interface PerpetualStatsI {
  midPrice: number;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  openInterest: number;
}

export const MOCK_PERPETUAL_STATS: PerpetualStatsI = {
  midPrice: 21000.87,
  markPrice: 21002.01,
  indexPrice: 20999.72,
  fundingRate: 1,
  openInterest: 1.25,
};
