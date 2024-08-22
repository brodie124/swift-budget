import {Component, computed, inject, input, Input} from '@angular/core';
import {CardModule} from "primeng/card";
import {DecimalPipe, NgForOf} from "@angular/common";
import {ConfirmationService, MessageService, PrimeTemplate} from "primeng/api";
import {EventQuickListItem} from "../../event-quick-list.component";
import {FinancialEventHistoryManager} from "../../../../services/financial-event-history-manager.service";
import {Button} from "primeng/button";
import {AsyncConfirmationService} from "../../../../services/async-confirmation.service";

@Component({
  selector: 'app-event-quick-list-item',
  standalone: false,
  // imports: [
  //   CardModule,
  //   DecimalPipe,
  //   NgForOf,
  //   PrimeTemplate,
  //   Button
  // ],
  templateUrl: './event-quick-list-item.component.html',
  styleUrl: './event-quick-list-item.component.less'
})
export class EventQuickListItemComponent {
  private readonly _confirmationService: AsyncConfirmationService = inject(AsyncConfirmationService);
  private readonly _messageService: MessageService =  inject(MessageService);
  private readonly _financialEventHistoryManager: FinancialEventHistoryManager = inject(FinancialEventHistoryManager);

  public item = input.required<EventQuickListItem>();
  public isDueSoon = computed(() =>
    !this.item().calculatedEvent.isPaid
    && this.item().nextOccurrence.timeUntil.days >= 0
    && this.item().nextOccurrence.timeUntil.days <= 2);

  public isOverdue = computed(() =>
    !this.item().calculatedEvent.isPaid
    && this.item().nextOccurrence.timeUntil.days < 0)

  public async markAsPaidAsync(): Promise<void> {
    await this._financialEventHistoryManager.markPaidAsync(
      this.item().financialEvent.uid,
      this.item().nextOccurrence.date.add(1, 'second'));
  }

  public async delete(event: MouseEvent, item: EventQuickListItem) {
    const result = await this._confirmationService.confirmAsync({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this bill?',
      header: 'Delete bill',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",
    });

    console.log(`Confirmation result: ${result}`);
    if (result === 'rejected')
      return;

    this._messageService.add({
      severity: 'success',
      summary: "Bill deleted.",
      detail: `${item.financialEvent.name} has been deleted.`
    })
  }
}
