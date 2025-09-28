import { DateTimeIsoString } from "../../../../types/common-types";
import { RecurrenceRuleAdvancedOptions } from "./recurrence-rule-advanced-options";
import { BaseRecurrenceRule } from "./recurrence-rule";
import { MonthlyRecurrenceStrategyOptions } from "../../recurrence-strategies/monthly-recurrence-strategy";

export interface MonthlyRecurrenceRule extends BaseRecurrenceRule {
  type: 'monthly';
  startDate: DateTimeIsoString;
  endDate: DateTimeIsoString | null;
  strategyOptions: MonthlyRecurrenceStrategyOptions;
  advancedOptions: RecurrenceRuleAdvancedOptions;
}
