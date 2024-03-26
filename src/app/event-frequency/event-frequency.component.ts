import {Component} from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'app-event-frequency',
  templateUrl: './event-frequency.component.html',
  styleUrls: ['./event-frequency.component.less']
})
export class EventFrequencyComponent {

  private readonly _recurringEvent: RecurringEvent;


  public readonly asRecurringEventDaily = (recurringEvent: RecurringEvent): RecurringEventDaily | undefined =>
    recurringEvent.frequency === EventFrequency.Daily
      ? recurringEvent as RecurringEventDaily
      : undefined;


  public get recurringEvent(): RecurringEvent {
    return this._recurringEvent;
  }

  public get EventFrequency(): typeof EventFrequency {
    return EventFrequency;
  }

  constructor() {
    this._recurringEvent = {
      frequency: EventFrequency.Daily,
      selectedDays: [CalendarDay.Monday, CalendarDay.Tuesday, CalendarDay.Wednesday, CalendarDay.Thursday, CalendarDay.Friday, CalendarDay.Saturday],
      advancedOptions: {
        weekdaysAllowed: true,
        weekendsAllowed: true,
        workingDaysAllowed: true,
        invalidDayFallback: InvalidDayFallback.NextAllowedDay
      }
    }
  }

}


export interface RecurringEventDaily {
  frequency: EventFrequency.Daily;
  selectedDays: Array<CalendarDay>;
}

export interface RecurringEventWeekly {
  frequency: EventFrequency.Weekly;
  selectedDay: CalendarDay;
}

export interface RecurringEventMonthly {
  frequency: EventFrequency.Weekly;
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


export interface RecurringEventAdvancedOptions {
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

export type RecurringEvent =
  RecurringEventAdvancedOptions
  & (RecurringEventDaily | RecurringEventWeekly | RecurringEventMonthly);


export enum EventFrequency {
  Daily,
  Weekly,
  Monthly,
  Quarterly,
  Biannually,
  Annually,
}

export enum CalendarDay {
  Monday= 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday'
}

export enum CalendarMonth {
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December
}
