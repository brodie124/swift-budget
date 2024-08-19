import {EnvironmentConfig} from "./environment-config";

export const environment: EnvironmentConfig = {
  isProduction: false,
  enableNavbar: true,
  cacheKeys: {
    eventList: 'sb-recurring-events',
    eventHistory: 'sb-event-history',
    paydayPreference: 'sb-event-quick-list-preferences_payday',
  }
};
