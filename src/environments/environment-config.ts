export type EnvironmentConfig = {
  readonly isProduction: boolean;
  readonly enableNavbar: boolean;
  readonly cacheKeys: {
    readonly eventList: string;
    readonly eventHistory: string;
    readonly paydayPreference: string;
  }
}
