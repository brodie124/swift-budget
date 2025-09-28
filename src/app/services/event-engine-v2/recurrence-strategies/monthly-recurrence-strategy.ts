import { MonthlyRecurrenceRule } from "../types/recurrence-rules/monthly-recurrence-rule";
import { DateUtils } from "../utils/date-utils";
import { IRecurrenceStrategy } from "./recurrence-strategy";

export type MonthlyRecurrenceStrategyOptions = {
  subtype: 'specific-date';
  dateOfMonth: number;
} | {
  subtype: 'specific-day';
  dayOfWeek: number;
  weekOfMonth: number;
};

export class MonthlyRecurrenceStrategy implements IRecurrenceStrategy {
  compute(
    startDate: Date,
    endDate: Date,
    rule: MonthlyRecurrenceRule
  ): Array<Date> {
    const occurrences: Date[] = [];
    let current = DateUtils.fromISODate(rule.startDate);
    const interval = 1;

    if (rule.strategyOptions.subtype !== 'specific-date') {
      throw new Error('specific-date not support for MonthlyRecurrenceStrategy.');
    }

    const dayOfMonth = rule.strategyOptions.dateOfMonth;
    let count = 0;

    while (current <= endDate) {
      if (current >= startDate) {
        if (rule.endDate && current > DateUtils.fromISODate(rule.endDate)) {
          break;
        }
        // if (rule.occurrenceCount && count >= rule.occurrenceCount) {
        //   break;
        // }

        // Handle end-of-month edge cases
        if (dayOfMonth) {
          const targetDate = new Date(current);
          targetDate.setDate(Math.min(dayOfMonth, this.getDaysInMonth(targetDate)));

          if (targetDate >= startDate && targetDate <= endDate) {
            occurrences.push(targetDate);
            count++;
          }
        } else {
          occurrences.push(new Date(current));
          count++;
        }
      }

      current = DateUtils.addMonths(current, interval);
    }

    return occurrences;
  }


  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }
}
