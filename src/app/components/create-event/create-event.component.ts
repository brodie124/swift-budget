import {Component, effect, input} from '@angular/core';
import {EventFrequency} from "../../types/event/event-frequency";
import {EventTrigger, InvalidDayFallback} from "../../types/event/event";
import {AllCalendarMonths} from "../../types/calendar/calendar-types";
import {EventManagerService} from "../../services/event-manager.service";
import {Router} from "@angular/router";
import {FinancialEvent} from "../../types/financial/financial-event";
import {getMomentUtc} from "../../utils/moment-utils";

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.less']
})
export class CreateEventComponent {

  public readonly EventFrequency: typeof EventFrequency = EventFrequency;
  public readonly InvalidDayFallback: typeof InvalidDayFallback = InvalidDayFallback;

  public mode = input.required<'create' | 'edit'>();
  public existingEvent = input<FinancialEvent>();

  public name: string = '';
  public description: string = '';
  public cost: number = 0;

  public eventFrequency: EventFrequency = this.existingEvent()?.trigger?.frequency ?? EventFrequency.Monthly;
  public eventType: 'specific-date' = 'specific-date';
  public specificDate?: Date;

  public invalidDayFallback: InvalidDayFallback = InvalidDayFallback.NextAllowedDay;
  public allowWeekdays: boolean = true;
  public allowWeekends: boolean = this.existingEvent()?.trigger?.advancedOptions.weekendsAllowed ?? false;
  public allowWorkingDays: boolean = this.existingEvent()?.trigger?.advancedOptions?.workingDaysAllowed ?? true;

  public frequencyCategoryOptions = [
    { label: 'month', value: EventFrequency.Monthly }
  ];

  public frequencyOperationOptions  = [
    { label: 'specific date', value: 'specific-date' }
  ];

  constructor(
    private readonly _router: Router,
    private readonly _eventManager: EventManagerService,
  ) {
    effect(() => {
      if (this.mode() !== 'edit')
        return;

      const existingEvent = this.existingEvent();
      if (!existingEvent)
        return;

      this.name = existingEvent.name;
      this.cost = existingEvent.expense;
      this.description = existingEvent.description ?? '';

      this.eventFrequency = existingEvent.trigger.frequency;

      this.invalidDayFallback = existingEvent.trigger.advancedOptions.invalidDayFallback;
      this.allowWeekdays = existingEvent.trigger.advancedOptions.weekdaysAllowed;
      this.allowWeekends = existingEvent.trigger.advancedOptions.weekendsAllowed;
      this.allowWorkingDays = existingEvent.trigger.advancedOptions.workingDaysAllowed;

      if (existingEvent?.trigger?.frequency === EventFrequency.Monthly && existingEvent.trigger.options.type === 'specific-date') {
        this.eventType = existingEvent.trigger.options.type;
        this.specificDate = getMomentUtc().set('date', existingEvent.trigger.options.dayOfMonth).toDate();
      }
    });
  }

  public async create(): Promise<void> {
    // TODO: this setup is incredibly specific to the Monthly/specific-date configuration
    if(this.eventFrequency !== EventFrequency.Monthly)
      throw new Error('Unhandled event frequency!');

    if(!this.specificDate?.getDate())
      throw new Error('Specific date is null!');

    const x: EventTrigger = {
      frequency: this.eventFrequency,
      selectedMonths: [...AllCalendarMonths],
      options: {
        type: this.eventType,
        dayOfMonth:  this.specificDate?.getDate() ?? 0
      },
      advancedOptions: {
        invalidDayFallback: this.invalidDayFallback,
        weekdaysAllowed: this.allowWeekdays,
        weekendsAllowed: this.allowWeekends,
        workingDaysAllowed: this.allowWorkingDays
      }
    };

    const uid = crypto.randomUUID().replace('-', '');
    const financialEvent: FinancialEvent = {
      uid: uid,
      name: this.name,
      description: this.description,
      expense: this.cost,
      trigger: x,
    }

    console.log("Constructed recurring event:", x);
    await this._eventManager.addAsync(financialEvent);
    await this._router.navigate(['']);

  }

  public async cancel(): Promise<void> {
    // TODO: add confirmation
    await this._router.navigate(['']);
  }
}
