import {EventFrequency} from "./event-frequency";
import {CalendarDay, CalendarMonth} from "../calendar/calendar-types";

export interface EventTriggerDaily {
  frequency: EventFrequency.Daily;
  selectedDays: Array<CalendarDay>;
}

export interface EventTriggerWeekly {
  frequency: EventFrequency.Weekly;
  selectedDay: CalendarDay;
}

export interface EventTriggerMonthly {
  frequency: EventFrequency.Monthly;
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


export interface EventTriggerAdvancedOptions {
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

export type EventTrigger =
  EventTriggerAdvancedOptions
  & (EventTriggerDaily | EventTriggerWeekly | EventTriggerMonthly);
