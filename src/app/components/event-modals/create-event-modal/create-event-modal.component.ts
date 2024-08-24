import {Component, effect, inject, input, OnInit, output, signal, ViewChild} from '@angular/core';
import {EventFrequency} from "../../../types/event/event-frequency";
import {EventTrigger, InvalidDayFallback} from "../../../types/event/event";
import {AllCalendarMonths} from "../../../types/calendar/calendar-types";
import {EventManagerService} from "../../../services/event-manager.service";
import {Router} from "@angular/router";
import {FinancialEvent} from "../../../types/financial/financial-event";
import {getMomentUtc} from "../../../utils/moment-utils";
import {
  EventCreateEditMultiFormComponent
} from "../event-create-edit-multi-form/event-create-edit-multi-form.component";
import {waitAsync} from "../../../utils/async-utils";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-create-event-modal',
  templateUrl: './create-event-modal.component.html',
  styleUrls: ['./create-event-modal.component.less']
})
export class CreateEventModalComponent implements OnInit {
  private readonly _eventManager = inject(EventManagerService);
  private readonly _messageService = inject(MessageService);

  @ViewChild(EventCreateEditMultiFormComponent, {static: true})
  private readonly _eventCreateEditMultiForm: EventCreateEditMultiFormComponent = undefined!;

  public visible = signal<boolean>(false);

  public created = output<void>();
  public cancelled = output<void>();
  public closed = output<void>();

  public async ngOnInit() {
    if (!this._eventCreateEditMultiForm)
      throw new Error('Create/Edit Multi-Form not found!');

    await waitAsync(100);
    this.visible.set(true);
  }

  public async create() {
    const financialEvent = await this._eventCreateEditMultiForm.createFinancialEventAsync();
    if (!financialEvent) {
      console.info("Couldn't create financial event");
      return;
    }

    let hasCreated = false;
    try {
      await this._eventManager.addAsync(financialEvent);
      hasCreated = true;
    } catch (err) {
      console.error("Failed to update event", err);
    }

    if (hasCreated) {
      this._messageService.add({
        severity: 'success',
        summary: "Bill created.",
        detail: `${financialEvent.name} has been created.`
      });

    } else {
      this._messageService.add({
        severity: 'danger',
        summary: "Could not create bill.",
        detail: `An error occurred while creating the bill.`
      });
    }

    this.created.emit();
    await this.closeAsync();
  }

  public async cancel() {
    this.cancelled.emit();
    await this.closeAsync();
  }

  private async closeAsync() {
    this.visible.set(false);
    await waitAsync(100);
    this.closed.emit();

  }
}
