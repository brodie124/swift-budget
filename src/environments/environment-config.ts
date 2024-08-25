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

    readonly firebaseAccessToken: string,
  },
  readonly enableNavbar: boolean;
}
