export type RecurrenceRuleAdvancedOptions = {
  weekdaysAllowed: boolean;
  weekendsAllowed: boolean;
  workingDaysAllowed: boolean;
  invalidDayFallback: InvalidDayFallback;
}

export enum InvalidDayFallback {
  PreviousAllowedDay,
  NextAllowedDay,
  NearestAllowedDay
}
