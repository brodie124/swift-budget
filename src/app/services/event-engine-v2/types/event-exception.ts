import {DateTimeIsoString, Guid} from "../../../types/common-types";
import {RecurringEventDefinition} from "./recurring-event-definition";
import { EventOccurrence } from "./event-occurrence";

export type EventException =
  | CancelledEventException
  | ModifiedEventException
  | RescheduledEventException;

export interface BaseEventException {
  id: Guid;
  recurringEventId: Guid;
  originalDate: DateTimeIsoString;
  createdAt: Date;
  notes?: string | null;
}

export interface CancelledEventException extends BaseEventException {
  type: 'cancelled';
}

export interface ModifiedEventException extends BaseEventException {
  type: 'modified';
  definitionChanges: Partial<RecurringEventDefinition>;
  occurrenceChanges: Partial<EventOccurrence>;
}

export interface RescheduledEventException extends BaseEventException {
  type: 'rescheduled';
  newDate: DateTimeIsoString;
}
