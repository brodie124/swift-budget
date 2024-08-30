import {Component, effect, input} from '@angular/core';
import {FinancialEvent} from "../../../types/financial/financial-event";
import {Router} from "@angular/router";
import {EventManagerService} from "../../../services/financial-events/event-manager.service";
import {getMomentUtc} from "../../../utils/moment-utils";
import {EventTrigger, InvalidDayFallback} from "../../../types/event/event";
import {AllCalendarMonths} from "../../../types/calendar/calendar-types";
import {EventFrequency} from 'src/app/types/event/event-frequency';
import {Button} from "primeng/button";
import {CalendarModule} from "primeng/calendar";
import {CheckboxModule} from "primeng/checkbox";
import {DropdownModule} from "primeng/dropdown";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {InputGroupModule} from "primeng/inputgroup";
import {InputNumberModule} from "primeng/inputnumber";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {NgTemplateOutlet} from "@angular/common";
import {PrimeTemplate} from "primeng/api";
import {RadioButtonModule} from "primeng/radiobutton";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {StepperModule} from "primeng/stepper";
import {useTouchUi} from "../../../utils/screen-utils";

@Component({
  selector: 'app-event-create-edit-multi-form',
  standalone: true,
  imports: [
    Button,
    CalendarModule,
    CheckboxModule,
    DropdownModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    NgTemplateOutlet,
    PrimeTemplate,
    RadioButtonModule,
    ReactiveFormsModule,
    StepperModule,
    FormsModule
  ],
  templateUrl: './event-create-edit-multi-form.component.html',
  styleUrl: './event-create-edit-multi-form.component.less'
})
export class EventCreateEditMultiFormComponent {

  public readonly EventFrequency: typeof EventFrequency = EventFrequency;
  public readonly InvalidDayFallback: typeof InvalidDayFallback = InvalidDayFallback;

  public get useTouchUi(): boolean {
    return useTouchUi();
  }

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

  public async createFinancialEventAsync(): Promise<FinancialEvent | null> {
    // TODO: this setup is incredibly specific to the Monthly/specific-date configuration
    if(this.eventFrequency !== EventFrequency.Monthly) {
      console.error(new Error('Unhandled event frequency!'));
      return null;
    }

    if(!this.specificDate?.getDate()) {
      console.error(new Error('Specific date is null!'));
      return null;
    }

    const trigger: EventTrigger = {
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

    const existingUid = this.mode() === 'edit' ? this.existingEvent()?.uid : undefined;
    const uid = existingUid ?? crypto.randomUUID().replace('-', '');
    return {
      uid: uid,
      name: this.name,
      description: this.description,
      expense: this.cost,
      trigger: trigger,
    };
  }

  public async cancel(): Promise<void> {
    // TODO: add confirmation
    await this._router.navigate(['']);
  }
}
