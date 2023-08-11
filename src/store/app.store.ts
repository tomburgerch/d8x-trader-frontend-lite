import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { LanguageE } from 'types/enums';
import { AppDimensionsI } from 'types/types';

const SELECTED_LANGUAGE_LS_KEY = 'd8x_selectedLanguage';
const SHOW_MODAl_LS_KEY = 'd8x_showWelcomeModal';
const SHOW_MODAL = 'show';
const HIDE_MODAL = 'hide';

export const selectedLanguageAtom = atomWithStorage<LanguageE>(SELECTED_LANGUAGE_LS_KEY, LanguageE.EN);

export const appDimensionsAtom = atom<AppDimensionsI>({});

export const showWelcomeModalAtom = atom(
  () => {
    const showModal = localStorage.getItem(SHOW_MODAl_LS_KEY);
    return showModal === null || showModal === SHOW_MODAL;
  },
  (_get, _set, show: boolean) => {
    localStorage.setItem(SHOW_MODAl_LS_KEY, show ? SHOW_MODAL : HIDE_MODAL);
  }
);
