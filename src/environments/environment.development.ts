import {EnvironmentConfig} from "./environment-config";

export const environment: EnvironmentConfig = {
  isProduction: false,
  cacheKeys: {
    eventList: 'sb-recurring-events',
    eventHistory: 'sb-event-history',
    paydayPreference: 'sb-event-quick-list-preferences_payday',
    encryptionPreference: 'sb-encryption-preference',
    encryptionCheck: 'sb-encryption-check',
  },
  enableNavbar: true,
};
