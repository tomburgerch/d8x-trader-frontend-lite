import { atom } from 'jotai';

import type { ReferralCodeI } from 'types/types';

export const isAgencyAtom = atom(false);
export const referralCodeAtom = atom<ReferralCodeI | null>(null);
