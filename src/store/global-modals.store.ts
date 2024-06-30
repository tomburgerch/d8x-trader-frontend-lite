import { atom } from 'jotai';
import { CurrencyItemI } from '../components/currency-selector/types';

export const accountModalOpenAtom = atom(false);
export const modalSelectedCurrencyAtom = atom<CurrencyItemI | null>(null);
export const depositModalOpenAtom = atom(false);
export const oneClickModalOpenAtom = atom(false);
export const connectModalOpenAtom = atom(false);
export const lifiModalOpenAtom = atom(false);
export const cedeModalOpenAtom = atom(false);
export const withdrawModalOpenAtom = atom(false);
export const extractSocialPKModalOpenAtom = atom(false);
export const extractOctPKModalOpenAtom = atom(false);
