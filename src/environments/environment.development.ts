import {EnvironmentConfig} from "./environment-config";

export const environment: EnvironmentConfig = {
  isProduction: false,
  api: {
    apiUrl: 'http://localhost:3000',
    oauthInitEndpoint: '/oauth/init'
  },
  cacheKeys: {
    eventList: 'sb-recurring-events',
    eventHistory: 'sb-event-history',
    paydayPreference: 'sb-event-quick-list-preferences_payday',
    encryptionPreference: 'sb-encryption-preference',
    encryptionCheck: 'sb-encryption-check',
    firebaseAccessToken: 'sb-firebase-access-token',
  },
  enableNavbar: true,
};
