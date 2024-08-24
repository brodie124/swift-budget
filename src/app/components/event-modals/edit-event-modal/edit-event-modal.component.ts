import {Component, inject, input, OnInit, output, signal, ViewChild} from '@angular/core';
import {Button} from "primeng/button";
import {
  EventCreateEditMultiFormComponent
} from "../event-create-edit-multi-form/event-create-edit-multi-form.component";
import {FinancialEvent} from "../../../types/financial/financial-event";
import {DialogModule} from "primeng/dialog";
import {MessageService, PrimeTemplate} from "primeng/api";
import {EventManagerService} from "../../../services/event-manager.service";
import {waitAsync} from "../../../utils/async-utils";

@Component({
  selector: 'app-edit-event-modal',
  standalone: true,
  imports: [
    Button,
    EventCreateEditMultiFormComponent,
    DialogModule,
    PrimeTemplate
  ],
  templateUrl: './edit-event-modal.component.html',
  styleUrl: './edit-event-modal.component.less'
})
export class EditEventModalComponent implements OnInit {
  @ViewChild(EventCreateEditMultiFormComponent, {static: true})
  private readonly _eventCreateEditMultiForm: EventCreateEditMultiFormComponent = undefined!;
  private readonly _eventManager = inject(EventManagerService);
  private readonly _messageService = inject(MessageService);

  public event = input.required<FinancialEvent>();
  public visible = signal<boolean>(false);

  public saved = output<void>();
  public cancelled = output<void>();
  public closed = output<void>();

  public async ngOnInit() {
    if (!this._eventCreateEditMultiForm)
      throw new Error('Create/Edit Multi-Form not found!');

    await waitAsync(100);
    this.visible.set(true);
  }

  public async cancel() {
    this.saved.emit()
    await this.closeAsync()
  }

  public async save() {
    const financialEvent = await this._eventCreateEditMultiForm.createFinancialEventAsync();
    if (!financialEvent) {
      console.info("Couldn't create financial event");
      return;
    }

    let hasUpdated = false;
    try {
      await this._eventManager.updateAsync(financialEvent);
      hasUpdated = true;
    } catch (err) {
      console.error("Failed to update event", err);
    }

    if (hasUpdated) {
      this._messageService.add({
        severity: 'success',
        summary: "Bill updated.",
        detail: `${financialEvent.name} has been updated.`
      });

    } else {
      this._messageService.add({
        severity: 'danger',
        summary: "Could not update bill.",
        detail: `An error occurred while updating the bill.`
      });
    }


    this.saved.emit();
    await this.closeAsync();
  }

  public async closeAsync() {
    this.visible.set(false);
    await waitAsync(100);
    this.closed.emit();
  }
}
