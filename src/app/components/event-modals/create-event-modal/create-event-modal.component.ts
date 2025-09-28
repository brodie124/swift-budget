import {Component, inject, OnInit, output, signal, ViewChild} from '@angular/core';
import {RecurringEventDefinitionProvider} from "../../../services/event-engine-v2/recurring-event-definition-provider.service";
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
  private readonly _eventDefinitionProvider = inject(RecurringEventDefinitionProvider);
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
    const eventDefinition = await this._eventCreateEditMultiForm.createDefinition();
    if (!eventDefinition) {
      console.info("Couldn't create recurring event definition");
      return;
    }

    let hasCreated = false;
    try {
      await this._eventDefinitionProvider.addAsync(eventDefinition);
      hasCreated = true;
    } catch (err) {
      console.error("Failed to update event", err);
    }

    if (hasCreated) {
      this._messageService.add({
        severity: 'success',
        summary: "Bill created.",
        detail: `${eventDefinition.title} has been created.`
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
