import {Component, inject, input, OnInit, output, signal, ViewChild} from '@angular/core';
import {Button} from "primeng/button";
import {
  EventCreateEditMultiFormComponent
} from "../event-create-edit-multi-form/event-create-edit-multi-form.component";
import {DialogModule} from "primeng/dialog";
import {MessageService, PrimeTemplate} from "primeng/api";
import {RecurringEventDefinitionProvider} from "../../../services/event-engine-v2/recurring-event-definition-provider.service";
import {waitAsync} from "../../../utils/async-utils";
import {RecurringEventDefinition} from "../../../services/event-engine-v2/types/recurring-event-definition";
import { EventOccurrence } from "../../../services/event-engine-v2/types/event-occurrence";

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
  private readonly _eventDefinitionProvider = inject(RecurringEventDefinitionProvider);
  private readonly _messageService = inject(MessageService);

  public event = input.required<EventOccurrence>();
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
    this.cancelled.emit()
    await this.closeAsync()
  }

  public async save() {
    // TODO: edits should create modifications

    const updatedEvent = await this._eventCreateEditMultiForm.createDefinition();
    // const eventException = this._eventCreateEditMultiForm.createException();
    if (!updatedEvent) {
      console.info("Couldn't create event change");
      return;
    }

    let hasUpdated = false;
    // let event: RecurringEventDefinition | undefined = undefined;
    try {
      // const events = await this._eventDefinitionProvider.getAsync();
      // event = events.find(e => e.id === eventException.recurringEventId);
      // if(!event) {
      //   throw new Error('Event not found');
      // }

      // event.exceptions.push(eventException);
      await this._eventDefinitionProvider.updateAsync(updatedEvent);
      hasUpdated = true;
    } catch (err) {
      console.error("Failed to update event", err);
    }

    if (hasUpdated) {
      this._messageService.add({
        severity: 'success',
        summary: "Bill updated.",
        detail: `${updatedEvent?.title ?? 'Bill'} has been updated.`
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
    await waitAsync(250);
    this.closed.emit();
  }
}
