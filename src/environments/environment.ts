import {EnvironmentConfig} from "./environment-config";

export const environment: EnvironmentConfig = {
  isProduction: true,
  api: {
    apiUrl: 'https://api.swiftbudget.brodiepestell.net',
    oauthInitEndpoint: '/oauth/init'
  },
  cacheKeys: {
    eventList: 'sbe',
    eventHistory: 'sbeh',
    paydayPreference: 'sbeqlpp',
    encryptionPreference: 'sbep',
    encryptionCheck: 'sbec',
    apiAccessToken: 'sbaat',
    appdataOriginUuid: 'sbaou',
    appdataLastSyncTime: 'sbalst',
    appdataLastModifiedTime: 'sbalmt',
    enableCloudSync: 'sbecs',
  },
  enableNavbar: true,
};
