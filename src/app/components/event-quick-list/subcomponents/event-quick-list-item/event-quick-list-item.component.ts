import { Component, computed, inject, input, output } from '@angular/core';
import { MessageService } from "primeng/api";
import { EventQuickListItem } from "../../event-quick-list.component";
import { AsyncConfirmationService } from "../../../../services/primeng-enhancements/async-confirmation.service";
import {
  RecurringEventDefinitionProvider
} from "../../../../services/event-engine-v2/recurring-event-definition-provider.service";
import { EventOccurrence } from "../../../../services/event-engine-v2/types/event-occurrence";
import { EventQuickActionsService } from "../../../../services/event-engine-v2/event-quick-actions.service";

@Component({
  selector: 'app-event-quick-list-item',
  standalone: false,
  templateUrl: './event-quick-list-item.component.html',
  styleUrl: './event-quick-list-item.component.less'
})
export class EventQuickListItemComponent {
  private readonly _confirmationService: AsyncConfirmationService = inject(AsyncConfirmationService);
  private readonly _messageService: MessageService = inject(MessageService);
  private readonly _eventQuickActionsService: EventQuickActionsService = inject(EventQuickActionsService);

  private readonly _eventDefinitionProvider: RecurringEventDefinitionProvider = inject(RecurringEventDefinitionProvider);

  public readonly deleted = output<EventOccurrence>();
  public readonly edited = output<EventOccurrence>();

  public item = input.required<EventQuickListItem>();
  public isDueSoon = computed(() =>
    this.item().occurrence.status !== 'paid'
    && !this.item().isOverdue
    && this.item().nextOccurrenceDate.timeUntil.days <= 2);

  public async markAsPaidAsync(): Promise<void> {
    await this._eventQuickActionsService.updateStatusAsync(this.item().occurrence, 'paid');
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

    const hasDeleted = await this._eventDefinitionProvider.removeAsync(item.definition.id);
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
      detail: `${item.definition.title} has been deleted.`
    });

    this.deleted.emit(item.occurrence);
  }

  edit(item: EventQuickListItem) {
    this.edited.emit(item.occurrence);
  }
}
