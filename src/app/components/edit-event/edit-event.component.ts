import {Component, inject, input, OnInit, output, signal, ViewChild} from '@angular/core';
import {Button} from "primeng/button";
import {
  EventCreateEditMultiFormComponent
} from "../event-create-edit-multi-form/event-create-edit-multi-form.component";
import {FinancialEvent} from "../../types/financial/financial-event";
import {DialogModule} from "primeng/dialog";
import {PrimeTemplate} from "primeng/api";
import {EventManagerService} from "../../services/event-manager.service";

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [
    Button,
    EventCreateEditMultiFormComponent,
    DialogModule,
    PrimeTemplate
  ],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.less'
})
export class EditEventComponent implements OnInit {
  @ViewChild(EventCreateEditMultiFormComponent, { static: true })
  private readonly _eventCreateEditMultiForm: EventCreateEditMultiFormComponent = undefined!;
  private readonly _eventManager = inject(EventManagerService);

  public event = input.required<FinancialEvent>();
  public visible = signal<boolean>(false);

  public saved = output<void>();
  public cancelled = output<void>();
  public closed = output<void>();

  public async ngOnInit() {
    if (!this._eventCreateEditMultiForm)
      throw new Error('Create/Edit Multi-Form not found!');

    await this.awaitAsync(100);
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

    await this._eventManager.updateAsync(financialEvent);

    this.saved.emit();
    await this.closeAsync();
  }

  public async closeAsync() {
    this.visible.set(false);
    await this.awaitAsync(100);
    this.closed.emit();
  }

  private awaitAsync(timeMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeMs));
  }
}
