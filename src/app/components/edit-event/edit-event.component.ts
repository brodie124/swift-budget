import {Component, input, output, signal} from '@angular/core';
import {Button} from "primeng/button";
import {
  EventCreateEditMultiFormComponent
} from "../event-create-edit-multi-form/event-create-edit-multi-form.component";
import {FinancialEvent} from "../../types/financial/financial-event";
import {DialogModule} from "primeng/dialog";
import {PrimeTemplate} from "primeng/api";

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
export class EditEventComponent {

  public event = input.required<FinancialEvent>();
  public visible = signal<boolean>(true);

  public saved = output<void>();
  public cancelled = output<void>();
  public closed = output<void>();


  public async cancel() {
    this.saved.emit()
    await this.closeAsync()
  }

  public async save() {
    this.saved.emit();
    await this.closeAsync();
  }

  public async closeAsync() {
    this.visible.set(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    this.closed.emit();
  }
}
