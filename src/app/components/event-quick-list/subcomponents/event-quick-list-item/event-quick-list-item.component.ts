import {Component, computed, inject, input, Input} from '@angular/core';
import {CardModule} from "primeng/card";
import {DecimalPipe, NgForOf} from "@angular/common";
import {PrimeTemplate} from "primeng/api";
import {EventQuickListItem} from "../../event-quick-list.component";
import {FinancialEventHistoryManager} from "../../../../services/financial-event-history-manager.service";
import {Button} from "primeng/button";

@Component({
  selector: 'app-event-quick-list-item',
  standalone: true,
  imports: [
    CardModule,
    DecimalPipe,
    NgForOf,
    PrimeTemplate,
    Button
  ],
  templateUrl: './event-quick-list-item.component.html',
  styleUrl: './event-quick-list-item.component.less'
})
export class EventQuickListItemComponent {
  private readonly _financialEventHistoryManager: FinancialEventHistoryManager = inject(FinancialEventHistoryManager);

  public item = input.required<EventQuickListItem>();
  public isDueSoon = computed(() =>
    !this.item().calculatedEvent.isPaid
    && this.item().nextOccurrence.timeUntil.days >= 0
    && this.item().nextOccurrence.timeUntil.days <= 2);

  public isOverdue = computed(() =>
    !this.item().calculatedEvent.isPaid
    && this.item().nextOccurrence.timeUntil.days < 0)

  public markAsPaid() {
    this._financialEventHistoryManager.markPaid(
      this.item().financialEvent.uid,
      this.item().nextOccurrence.date.add(1, 'second'));
  }
}
