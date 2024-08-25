﻿export type EnvironmentConfig = {
  readonly isProduction: boolean;
  readonly cacheKeys: {
    readonly eventList: string;
    readonly eventHistory: string;
    readonly paydayPreference: string;

    readonly encryptionPreference: string;
    readonly encryptionCheck: string;

    readonly firebaseAccessToken: string,
  },
  readonly enableNavbar: boolean;
  readonly oauthInitUrl: string;
}
