import {EventTrigger} from "../event/event";
import moment from "moment";

export type FinancialEventId = string;

export type FinancialEvent = {
  uid: FinancialEventId;
  name: string;
  description?: string;
  expense: number;
  trigger: EventTrigger;
}

export type FinancialEventHistory = {
  eventUid: FinancialEventId;
  lastMarkedPaid?: moment.Moment;
  lastUpdated: moment.Moment;
}

export type FinancialEventOccurrence = {
  occurrenceId: string;
  event: FinancialEvent,
  history: FinancialEventHistory;
  date: moment.Moment;
  isPaid: boolean;
}
