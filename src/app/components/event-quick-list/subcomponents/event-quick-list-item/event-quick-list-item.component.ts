import {Component, computed, inject, input, output} from '@angular/core';
import {MessageService} from "primeng/api";
import {EventQuickListItem} from "../../event-quick-list.component";
import {FinancialEventHistoryManager} from "../../../../services/financial-event-history-manager.service";
import {AsyncConfirmationService} from "../../../../services/async-confirmation.service";
import {EventManagerService} from "../../../../services/event-manager.service";

@Component({
  selector: 'app-event-quick-list-item',
  standalone: false,
  templateUrl: './event-quick-list-item.component.html',
  styleUrl: './event-quick-list-item.component.less'
})
export class EventQuickListItemComponent {
  private readonly _confirmationService: AsyncConfirmationService = inject(AsyncConfirmationService);
  private readonly _messageService: MessageService = inject(MessageService);

  private readonly _financialEventHistoryManager: FinancialEventHistoryManager = inject(FinancialEventHistoryManager);
  private readonly _eventManagerService: EventManagerService = inject(EventManagerService);

  public readonly deleted = output<void>();

  public item = input.required<EventQuickListItem>();
  public isDueSoon = computed(() =>
    !this.item().calculatedEvent.isPaid
    && !this.item().isOverdue
    && this.item().nextOccurrence.timeUntil.days <= 2);

  public async markAsPaidAsync(): Promise<void> {
    await this._financialEventHistoryManager.markPaidAsync(
      this.item().financialEvent.uid,
      this.item().nextOccurrence.date.add(1, 'second'));
  }

  public async delete(item: EventQuickListItem) {
    const result = await this._confirmationService.confirmAsync({
      message: 'Are you sure you want to delete this bill?',
      header: 'Delete bill',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
    });

    console.log(`Confirmation result: ${result}`);
    if (result === 'rejected')
      return;

    const hasDeleted = await this._eventManagerService.removeAsync(item.financialEvent.uid);
    if (!hasDeleted) {
      this._messageService.add({
        severity: 'danger',
        summary: "Could not delete bill.",
        detail: `An error occurred while deleting the bill.`
      });
      return;
    }

    this._messageService.add({
      severity: 'success',
      summary: "Bill deleted.",
      detail: `${item.financialEvent.name} has been deleted.`
    });

    this.deleted.emit();
  }
}
