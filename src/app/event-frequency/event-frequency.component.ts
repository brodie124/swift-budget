import {Component} from '@angular/core';
import {CalendarDay} from "../types/calendar/calendar-types";
import { EventFrequency } from '../types/event/event-frequency';
import {InvalidDayFallback, EventTrigger, EventTriggerDaily} from "../types/event/event";

@Component({
  selector: 'app-event-frequency',
  templateUrl: './event-frequency.component.html',
  styleUrls: ['./event-frequency.component.less']
})
export class EventFrequencyComponent {

  private readonly _eventTrigger: EventTrigger;


  public readonly asRecurringEventDaily = (trigger: EventTrigger): EventTriggerDaily | undefined =>
    trigger.frequency === EventFrequency.Daily
      ? trigger as EventTriggerDaily
      : undefined;


  public get eventTrigger(): EventTrigger {
    return this._eventTrigger;
  }

  public get EventFrequency(): typeof EventFrequency {
    return EventFrequency;
  }

  constructor() {
    this._eventTrigger = {
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







