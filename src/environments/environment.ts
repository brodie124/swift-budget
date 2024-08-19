import {EnvironmentConfig} from "./environment-config";

export const environment: EnvironmentConfig = {
  isProduction: true,
  enableNavbar: false,
  cacheKeys: {
    eventList: 'sbe',
    eventHistory: 'sbeh',
    paydayPreference: 'sbeqlp_p',
  }
};
