import { RecurringEventDefinition } from "../../services/event-engine-v2/types/recurring-event-definition";

export type AppdataPackage = {
  isEncrypted: boolean;
  check?: string; // used to validate encryption
  originUuid: string; // used to track if we're overwriting a totally different appdata or not
  uploadTimestamp: number;

  eventList: ReadonlyArray<RecurringEventDefinition>;
  encryptionPreference: boolean;
}


export function isAppdataPackage(obj: any): obj is AppdataPackage {
  return obj
    && typeof obj.isEncrypted === 'boolean'
    && (!obj.isEncrypted || typeof obj.check === 'string')
    && typeof obj.originUuid === 'string'
    && typeof obj.uploadTimestamp === 'number'
    && typeof obj.encryptionPreference === 'boolean'
    && Array.isArray(obj.eventHistory)
    && Array.isArray(obj.eventList)
}
