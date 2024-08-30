import {Trigger} from "../event/trigger";
import moment from "moment";

export type FinancialEventId = string;

export type FinancialEvent = {
  uid: FinancialEventId;
  name: string;
  description?: string;
  expense: number;
  trigger: Trigger;
}

export type FinancialEventHistory = {
  eventUid: FinancialEventId;
  lastMarkedPaid?: string;
  lastUpdated: string;
}

export type FinancialEventOccurrence = {
  occurrenceId: string;
  event: FinancialEvent,
  history: FinancialEventHistory;
  date: moment.Moment;
  isPaid: boolean;
}
