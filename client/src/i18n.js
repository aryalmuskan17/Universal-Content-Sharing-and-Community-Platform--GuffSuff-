import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // loads translations from your locales folder
  .use(HttpBackend)
  // detects user language
  .use(LanguageDetector)
  // passes i18n instance to react-i18next
  .use(initReactI18next)
  // initializes i18next
  .init({
    fallbackLng: 'en',
    debug: true, // You can set this to false in production

    interpolation: {
      escapeValue: false, // not needed for React as it escapes by default
    },

    backend: {
      // Path where translations are stored
      loadPath: '/locales/{{lng}}/translation.json',
    },
  });

export default i18n;