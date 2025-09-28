import {DateTimeIsoString} from "../../../types/common-types";
import {
  InvalidDayFallback,
  RecurrenceRuleAdvancedOptions
} from "../types/recurrence-rules/recurrence-rule-advanced-options";

export class DateUtils {
  public static toISODate(date: Date): DateTimeIsoString {
    return date.toISOString().split('T')[0];
  }

  public static fromISODate(dateStr: DateTimeIsoString): Date {
    return new Date(dateStr);
  }

  public static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  public static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  public static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  public static isWeekend(date: Date, weekendDays = [0, 6]): boolean {
    return weekendDays.includes(date.getDay());
  }

  static adjustForBusinessDay(
    date: Date,
    options: RecurrenceRuleAdvancedOptions
  ): Date {
    const weekendDays = [0, 6]; // Sunday, Saturday

    if (!this.isWeekend(date, weekendDays)) {
      return date;
    }

    let adjusted = new Date(date);

    switch (options.invalidDayFallback) {
      case InvalidDayFallback.PreviousAllowedDay:
        while (this.isWeekend(adjusted, weekendDays)) {
          adjusted = this.addDays(adjusted, -1);
        }
        break;
      case InvalidDayFallback.NextAllowedDay:
        while (this.isWeekend(adjusted, weekendDays)) {
          adjusted = this.addDays(adjusted, 1);
        }
        break;
      case InvalidDayFallback.NearestAllowedDay:
        const dayOfWeek = adjusted.getDay();
        adjusted = dayOfWeek === 0
          ? this.addDays(adjusted, 1) // Sunday
          : this.addDays(adjusted, -1) // Saturday
        break;
    }

    return adjusted;
  }
}
