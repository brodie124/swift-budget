import {FinancialEvent, FinancialEventHistory} from "../financial/financial-event";

export type AppdataPackage = {
  originUuid: string; // used to track if we're overwriting a totally different appdata or not
  uploadTimestamp: number;

  eventHistory: ReadonlyArray<FinancialEventHistory>;
  eventList: ReadonlyArray<FinancialEvent>;
  encryptionPreference: boolean;
}
