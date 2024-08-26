export type EnvironmentConfig = {
  readonly isProduction: boolean;
  readonly api: {
    readonly apiUrl: string;
    readonly oauthInitEndpoint: string;
  }
  readonly cacheKeys: {
    readonly eventList: string;
    readonly eventHistory: string;
    readonly paydayPreference: string;

    readonly encryptionPreference: string;
    readonly encryptionCheck: string;

    readonly apiAccessToken: string,

    readonly appdataLastSyncTime: string;
    readonly appdataLastModifiedTime: string;
    readonly appdataOriginUuid: string;

    readonly enableCloudSync: string;
  },
  readonly enableNavbar: boolean;
}
