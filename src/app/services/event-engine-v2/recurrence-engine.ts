import {IRecurrenceStrategy} from "./recurrence-strategies/recurrence-strategy";
import {RecurrenceRule} from "./types/recurrence-rules/recurrence-rule";
import {DateTimeIsoString} from "../../types/common-types";
import {DateUtils} from "./utils/date-utils";
import { MonthlyRecurrenceStrategy } from "./recurrence-strategies/monthly-recurrence-strategy";

export class RecurrenceEngine {
  private readonly _strategyMap: Map<string, IRecurrenceStrategy> = new Map([
    ['monthly', new MonthlyRecurrenceStrategy()]
  ]);

  public compute(rule: RecurrenceRule, startDate: Date | DateTimeIsoString, endDate: Date | DateTimeIsoString): Array<Date> {
    startDate = startDate instanceof Date ? startDate : new Date(startDate);
    endDate = endDate instanceof Date ? endDate : new Date(endDate);

    const strategy = this._strategyMap.get(rule.type);
    if (!strategy) {
      throw new Error(`Unsupported recurrence strategy: ${rule.type}`);
    }

    // TODO: the code within the if statement doesn't actually support all of the options
    let occurrences = strategy.compute(startDate, endDate, rule);
    if (!rule.advancedOptions.workingDaysAllowed
      || !rule.advancedOptions.weekdaysAllowed
      || !rule.advancedOptions.weekendsAllowed
    ) {
      occurrences = occurrences.map(e => DateUtils.adjustForBusinessDay(e, rule.advancedOptions));
    }

    return occurrences;
  }
}
