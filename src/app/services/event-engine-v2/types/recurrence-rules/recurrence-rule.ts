import { RecurrenceStrategyOptions } from "../../recurrence-strategies/recurrence-strategy";
import { RecurrenceRuleAdvancedOptions } from "./recurrence-rule-advanced-options";
import { MonthlyRecurrenceRule } from "./monthly-recurrence-rule";

export type RecurrenceRule = MonthlyRecurrenceRule;
export type ReferenceRuleType = 'monthly'

export interface BaseRecurrenceRule {
  type: ReferenceRuleType;
  strategyOptions: RecurrenceStrategyOptions;
  advancedOptions: RecurrenceRuleAdvancedOptions;
}
