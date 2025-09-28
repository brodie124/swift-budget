import {DateTimeIsoString, Guid} from "../../../types/common-types";
import {RecurrenceRule} from "./recurrence-rules/recurrence-rule";
import { EventException } from "./event-exception";

export type RecurringEventDefinition = {
  id: Guid;
  title: string;
  description: string | null;
  amount: number;
  category: string | null;
  recurrence: RecurrenceRule;
  createdAt: DateTimeIsoString;
  updatedAt: DateTimeIsoString;
  exceptions: Array<EventException>;
}
