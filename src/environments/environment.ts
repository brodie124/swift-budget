import {EnvironmentConfig} from "./environment-config";

export const environment: EnvironmentConfig = {
  isProduction: true,
  cacheKeys: {
    eventList: 'sbe',
    eventHistory: 'sbeh',
    paydayPreference: 'sbeqlpp',
    encryptionPreference: 'sbep',
    encryptionCheck: 'sbec',
    firebaseAccessToken: 'sbfat',
  },
  enableNavbar: false,
  oauthInitUrl: 'https://api.swiftbudget.brodiepestell.net/oauth/init'
};
