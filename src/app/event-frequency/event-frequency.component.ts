import {Component} from '@angular/core';
import moment from 'moment';
import {CalendarDay} from "../types/calendar/calendar-types";
import { EventFrequency } from '../types/event/event-frequency';
import {InvalidDayFallback, RecurringEvent, RecurringEventDaily} from "../types/event/event";

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







