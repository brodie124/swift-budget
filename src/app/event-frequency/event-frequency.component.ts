import {Component} from '@angular/core';
import {CalendarDay} from "../types/calendar/calendar-types";
import { TriggerFrequency } from '../types/event/trigger-frequency';
import {InvalidDayFallback, Trigger, TriggerDaily} from "../types/event/trigger";

@Component({
  selector: 'app-event-frequency',
  templateUrl: './event-frequency.component.html',
  styleUrls: ['./event-frequency.component.less']
})
export class EventFrequencyComponent {

  private readonly _trigger: Trigger;


  public readonly asRecurringEventDaily = (trigger: Trigger): TriggerDaily | undefined =>
    trigger.frequency === TriggerFrequency.Daily
      ? trigger as TriggerDaily
      : undefined;


  public get trigger(): Trigger {
    return this._trigger;
  }

  public get TriggerFrequency(): typeof TriggerFrequency {
    return TriggerFrequency;
  }

  constructor() {
    this._trigger = {
      frequency: TriggerFrequency.Daily,
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







