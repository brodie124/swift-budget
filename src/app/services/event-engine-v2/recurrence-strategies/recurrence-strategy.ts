import { RecurrenceRule } from "../types/recurrence-rules/recurrence-rule";

export interface IRecurrenceStrategy {
  compute(startDate: Date, endDate: Date, rule: RecurrenceRule): Array<Date>;
}

export type RecurrenceStrategyOptions = {}

