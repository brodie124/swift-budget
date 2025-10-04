import {
  isRecurringEventDefinition,
  RecurringEventDefinition
} from "../../services/event-engine-v2/types/recurring-event-definition";
import {CommonTypeGuards, StrictTypeGuardBuilder} from "@bpits/type-guards";

export type AppdataPackage = {
  isEncrypted: boolean;
  check?: string; // used to validate encryption
  originUuid: string; // used to track if we're overwriting a totally different appdata or not
  uploadTimestamp: number;

  eventList: ReadonlyArray<RecurringEventDefinition>;
  encryptionPreference: boolean;
}

export const isAppdataPackage = StrictTypeGuardBuilder
  .start<AppdataPackage>('AppdataPackage')
  .validateProperty('isEncrypted', CommonTypeGuards.basics.boolean())
  .validateProperty('check', CommonTypeGuards.basics.string().nullable(undefined))
  .validateProperty('originUuid', CommonTypeGuards.basics.string())
  .validateProperty('uploadTimestamp', CommonTypeGuards.basics.number())
  .validateProperty('eventList', CommonTypeGuards.array.arrayOf(isRecurringEventDefinition))
  .validateProperty('encryptionPreference', CommonTypeGuards.basics.boolean())
  .build();
