import { atom } from 'jotai';

import { ExpiryE, OrderBlockE, OrderTypeE, StopLossE, TakeProfitE } from 'types/enums';

export const orderBlockAtom = atom<OrderBlockE>(OrderBlockE.Long);
export const orderTypeAtom = atom<OrderTypeE>(OrderTypeE.Market);
export const orderSizeAtom = atom(0);
export const triggerPriceAtom = atom(0);
export const limitPriceAtom = atom(0);
export const leverageAtom = atom(1);
export const toleranceSliderAtom = atom(2);
export const expireDaysAtom = atom(ExpiryE['60D']);
export const stopLossAtom = atom(StopLossE['50%']);
export const takeProfitAtom = atom(TakeProfitE['50%']);
