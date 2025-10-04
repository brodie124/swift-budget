import {DateTimeIsoString, Guid} from "../../../types/common-types";
import {RecurrenceRule} from "./recurrence-rules/recurrence-rule";
import { EventException } from "./event-exception";
import {CommonTypeGuards, StrictTypeGuardBuilder} from "@bpits/type-guards";

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

export const isRecurringEventDefinition = StrictTypeGuardBuilder
    .start<RecurringEventDefinition>("RecurringEventDefinition")
    .validateProperty('id', CommonTypeGuards.basics.string())
    .validateProperty('title', CommonTypeGuards.basics.string())
    .validateProperty('description', CommonTypeGuards.basics.string().nullable(null))
    .validateProperty('amount', CommonTypeGuards.basics.number())
    .validateProperty('category', CommonTypeGuards.basics.string().nullable(null))
    .ignoreProperty('recurrence')
    .validateProperty('createdAt', CommonTypeGuards.date.dateString())
    .validateProperty('updatedAt', CommonTypeGuards.date.dateString())
    .validateProperty('exceptions', CommonTypeGuards.array.array())
    .build();
