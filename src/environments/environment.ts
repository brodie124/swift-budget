import {EnvironmentConfig} from "./environment-config";

export const environment: EnvironmentConfig = {
  isProduction: true,
  cacheKeys: {
    eventList: 'sbe',
    eventHistory: 'sbeh',
    paydayPreference: 'sbeqlpp',
    encryptionPreference: 'sbep',
  },
  enableNavbar: false,
  enableFirstTimeSetup: false,
};
