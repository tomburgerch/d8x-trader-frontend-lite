import { atom } from 'jotai';

import { TvChartPeriodE } from 'types/enums';
import { TvChartCandleI } from 'types/types';

export const candlesWebSocketReadyAtom = atom(false);
export const candlesAtom = atom<TvChartCandleI[]>([]);
export const newCandlesAtom = atom<TvChartCandleI[]>([]);
export const selectedPeriodAtom = atom<TvChartPeriodE>(TvChartPeriodE['1Hour']);
export const candlesDataReadyAtom = atom(false);
