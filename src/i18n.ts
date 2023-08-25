import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import XHR from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { LanguageE } from 'types/enums';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(XHR)
  .use(LanguageDetector)
  .init({
    load: 'languageOnly',
    ns: ['translations'],
    defaultNS: 'translations',
    fallbackLng: LanguageE.EN,
    react: {
      useSuspense: true,
    },
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

document.documentElement.lang = i18n.language;

i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
