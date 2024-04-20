import {Component} from '@angular/core';
import {EventFrequency} from "../../types/event/event-frequency";
import {InvalidDayFallback, RecurringEvent} from "../../types/event/event";
import {AllCalendarMonths} from "../../types/calendar/calendar-types";

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.less']
})
export class CreateEventComponent {

  public readonly EventFrequency: typeof EventFrequency = EventFrequency;
  public readonly InvalidDayFallback: typeof InvalidDayFallback = InvalidDayFallback;

  public eventFrequency: EventFrequency = EventFrequency.Monthly;
  public eventType: 'specific-date' = 'specific-date';
  public dayOfMonth: number = 1;

  public invalidDayFallback: InvalidDayFallback = InvalidDayFallback.NextAllowedDay;
  public allowWeekdays: boolean = true;
  public allowWeekends: boolean = false;
  public allowWorkingDays: boolean = true;

  public create(): void {
    // TODO: this setup is incredibly specific to the Monthly/specific-date configuration
    if(this.eventFrequency !== EventFrequency.Monthly) {
      throw new Error('Unhandled event frequency!');
    }

    const x: RecurringEvent = {
      frequency: this.eventFrequency,
      selectedMonths: [...AllCalendarMonths],
      options: {
        type: this.eventType,
        dayOfMonth: this.dayOfMonth
      },
      advancedOptions: {
        invalidDayFallback: this.invalidDayFallback,
        weekdaysAllowed: this.allowWeekdays,
        weekendsAllowed: this.allowWeekends,
        workingDaysAllowed: this.allowWorkingDays
      }
    };

    console.log("Constructed recurring event:", x);
  }
}
