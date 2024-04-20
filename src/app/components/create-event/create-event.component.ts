import {Component} from '@angular/core';
import {EventFrequency} from "../../types/event/event-frequency";
import {InvalidDayFallback, RecurringEvent} from "../../types/event/event";
import {AllCalendarMonths} from "../../types/calendar/calendar-types";
import {EventManagerService} from "../../services/event-manager.service";
import {Router} from "@angular/router";
import {FinancialEvent} from "../../types/financial/financial-event";

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.less']
})
export class CreateEventComponent {

  public readonly EventFrequency: typeof EventFrequency = EventFrequency;
  public readonly InvalidDayFallback: typeof InvalidDayFallback = InvalidDayFallback;

  public name: string = '';
  public description: string = '';
  public cost: number = 0;

  public eventFrequency: EventFrequency = EventFrequency.Monthly;
  public eventType: 'specific-date' = 'specific-date';
  public dayOfMonth: number = 1;

  public invalidDayFallback: InvalidDayFallback = InvalidDayFallback.NextAllowedDay;
  public allowWeekdays: boolean = true;
  public allowWeekends: boolean = false;
  public allowWorkingDays: boolean = true;

  constructor(
    private readonly _router: Router,
    private readonly _eventManager: EventManagerService,
  ) {
  }

  public async create(): Promise<void> {
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

    const financialEvent: FinancialEvent = {
      name: this.name,
      description: this.description,
      expense: this.cost,
      trigger: x,
    }

    console.log("Constructed recurring event:", x);
    await this._eventManager.add(financialEvent);
    await this._router.navigate(['']);

  }

  public async cancel(): Promise<void> {
    // TODO: add confirmation
    await this._router.navigate(['']);
  }
}
