import { OpenloginUserInfo } from '@web3auth/openlogin-adapter';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const WEB3_AUTH_ID_TOKEN_LS_KEY = 'd8x_web3AuthIdToken';

export const web3AuthIdTokenAtom = atomWithStorage(WEB3_AUTH_ID_TOKEN_LS_KEY, '');

export const socialUserInfoAtom = atom<Partial<OpenloginUserInfo> | null>(null);
export const socialPKAtom = atom<string | null>(null);
