import { Component, computed, effect, input } from '@angular/core';
import { Router } from "@angular/router";
import { getMomentUtc } from "../../../utils/moment-utils";
import { TriggerFrequency } from 'src/app/types/event/trigger-frequency';
import { CalendarModule } from "primeng/calendar";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputGroupModule } from "primeng/inputgroup";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { PrimeTemplate } from "primeng/api";
import { RadioButtonModule } from "primeng/radiobutton";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { StepperModule } from "primeng/stepper";
import { useTouchUi } from "../../../utils/screen-utils";
import { RecurringEventDefinition } from "../../../services/event-engine-v2/types/recurring-event-definition";
import {
  InvalidDayFallback
} from "../../../services/event-engine-v2/types/recurrence-rules/recurrence-rule-advanced-options";
import {
  RecurrenceRule,
  ReferenceRuleType
} from "../../../services/event-engine-v2/types/recurrence-rules/recurrence-rule";
import { EventException } from "../../../services/event-engine-v2/types/event-exception";
import { EventOccurrence } from "../../../services/event-engine-v2/types/event-occurrence";

@Component({
  selector: 'app-event-create-edit-multi-form',
  standalone: true,
  imports: [
    CalendarModule,
    CheckboxModule,
    DropdownModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
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

  public readonly EventFrequency: typeof TriggerFrequency = TriggerFrequency;
  public readonly InvalidDayFallback: typeof InvalidDayFallback = InvalidDayFallback;

  public get useTouchUi(): boolean {
    return useTouchUi();
  }

  public mode = input.required<'create' | 'edit'>();
  public existingOccurrence = input<EventOccurrence>();
  public existingEvent = computed(() => this.existingOccurrence()?.recurringEvent);

  public name: string = '';
  public description: string = '';
  public cost: number = 0;

  public eventFrequency: ReferenceRuleType = this.existingEvent()?.recurrence?.type ?? 'monthly';
  public eventType: 'specific-date' = 'specific-date';
  public specificDate?: Date;

  public invalidDayFallback: InvalidDayFallback = InvalidDayFallback.NextAllowedDay;
  public allowWeekdays: boolean = true;
  public allowWeekends: boolean = this.existingEvent()?.recurrence?.advancedOptions.weekendsAllowed ?? false;
  public allowWorkingDays: boolean = this.existingEvent()?.recurrence?.advancedOptions?.workingDaysAllowed ?? true;

  public frequencyCategoryOptions = [
    { label: 'month', value: 'monthly' }
  ];

  public frequencyOperationOptions  = [
    { label: 'specific date', value: 'specific-date' }
  ];

  constructor(
    private readonly _router: Router
  ) {
    effect(() => {
      if (this.mode() !== 'edit')
        return;

      const existingEvent = this.existingEvent();
      if (!existingEvent)
        return;

      this.name = existingEvent.title;
      this.cost = existingEvent.amount;
      this.description = existingEvent.description ?? '';

      // this.eventFrequency = existingEvent..frequency;

      this.invalidDayFallback = existingEvent.recurrence.advancedOptions.invalidDayFallback;
      this.allowWeekdays = existingEvent.recurrence.advancedOptions.weekdaysAllowed;
      this.allowWeekends = existingEvent.recurrence.advancedOptions.weekendsAllowed;
      this.allowWorkingDays = existingEvent.recurrence.advancedOptions.workingDaysAllowed;

      if (existingEvent.recurrence.type === 'monthly' && existingEvent.recurrence.strategyOptions.subtype === 'specific-date') {
        this.eventType = existingEvent.recurrence.strategyOptions.subtype;
        this.specificDate = getMomentUtc(existingEvent.recurrence.startDate).set('date', existingEvent.recurrence.strategyOptions.dateOfMonth).toDate();
      }
    });
  }

  public async createDefinition(): Promise<RecurringEventDefinition | null> {
    // TODO: this setup is incredibly specific to the Monthly/specific-date configuration
    if(this.eventFrequency !== 'monthly') {
      console.error(new Error('Unhandled event frequency!'));
      return null;
    }

    if(!this.specificDate?.getDate()) {
      console.error(new Error('Specific date is null!'));
      return null;
    }

    const existingUid = this.mode() === 'edit' ? this.existingEvent()?.id : undefined;
    const uid = existingUid ?? crypto.randomUUID().replace('-', '');
    const recurrenceRule = this.makeRecurrenceRule();
    return {
      id: uid,
      title: this.name,
      description: this.description,
      category: null,
      amount: this.cost,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exceptions: [],
      recurrence: recurrenceRule
    };
  }

  public createException(): EventException | null {
    const existingOccurrence = this.existingOccurrence();
    const existingEvent = existingOccurrence?.recurringEvent;
    if(!existingEvent) {
      console.error('Existing event is null - cannot create change!');
      return null;
    }

    // TODO: this setup is incredibly specific to the Monthly/specific-date configuration
    if(this.eventFrequency !== 'monthly') {
      console.error(new Error('Unhandled event frequency!'));
      return null;
    }

    if(!this.specificDate?.getDate()) {
      console.error(new Error('Specific date is null!'));
      return null;
    }

    const id = crypto.randomUUID().replace('-', '');
    const recurrenceRule = this.makeRecurrenceRule();
    return {
      type: 'modified',
      id: id,
      recurringEventId: existingEvent.id,
      createdAt: new Date(),
      originalDate: existingOccurrence.date,
      definitionChanges: {
        title: this.getIfDifferent(existingEvent.title, this.name) ?? undefined,
        amount: this.getIfDifferent(existingEvent.amount, this.cost) ?? undefined,
        description: this.getIfDifferent(existingEvent.description, this.description),
        recurrence: this.getIfDifferent(existingEvent.recurrence, recurrenceRule) ?? undefined
      },
      occurrenceChanges: {}
    }
  }

  public async cancel(): Promise<void> {
    // TODO: add confirmation
    await this._router.navigate(['']);
  }

  private getIfDifferent<T>(originalValue: T, newValue: T): T | null {
    if(JSON.stringify(originalValue) === JSON.stringify(newValue))
      return null;

    return newValue;
  }

  private makeRecurrenceRule(): RecurrenceRule {
    const startDate = this.specificDate
      ? new Date(this.specificDate)
      : new Date(Date.UTC(1970, 0, 0));

    startDate.setUTCHours(0, 0, 0, 0);

    return {
      type: 'monthly',
      startDate: startDate.toISOString(),
      endDate: null,
      strategyOptions: {
        subtype: 'specific-date',
        dateOfMonth: this.specificDate?.getDate() ?? 0
      },
      advancedOptions: {
        weekdaysAllowed: this.allowWeekdays,
        invalidDayFallback: this.invalidDayFallback,
        workingDaysAllowed: this.allowWorkingDays,
        weekendsAllowed: this.allowWeekends
      }
    };
  }
}
