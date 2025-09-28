import {DateTimeIsoString, Guid} from "../../../types/common-types";
import {RecurringEventDefinition} from "./recurring-event-definition";

export type EventOccurrence = {
  recurringEventId: Guid;
  recurringEvent: RecurringEventDefinition;
  date: DateTimeIsoString;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  isException?: boolean;
}
