import {TriggerFrequency} from "./trigger-frequency";
import {CalendarDay, CalendarMonth} from "../calendar/calendar-types";

export interface TriggerDaily {
  frequency: TriggerFrequency.Daily;
  selectedDays: Array<CalendarDay>;
}

export interface TriggerWeekly {
  frequency: TriggerFrequency.Weekly;
  selectedDay: CalendarDay;
}

export interface TriggerMonthly {
  frequency: TriggerFrequency.Monthly;
  selectedMonths: Array<CalendarMonth>;
  options: MonthlySpecificDateOptions | MonthlySpecificDayOptions | MonthlySpecificDaySpecialOptions;
}

export interface MonthlySpecificDateOptions {
  type: 'specific-date';
  dayOfMonth: number;
}

export interface MonthlySpecificDayOptions {
  type: 'specific-day';
  day: string;
  occurrenceInMonth: number;
}

export interface MonthlySpecificDaySpecialOptions {
  type: 'specific-day-special';
  position: 'first' | 'last';
}


export interface TriggerAdvancedOptions {
  advancedOptions: {
    weekdaysAllowed: boolean;
    weekendsAllowed: boolean;
    workingDaysAllowed: boolean;
    invalidDayFallback: InvalidDayFallback;
  }
}

export enum InvalidDayFallback {
  PreviousAllowedDay,
  NextAllowedDay
}

export type Trigger =
  TriggerAdvancedOptions
  & (TriggerDaily | TriggerWeekly | TriggerMonthly);
