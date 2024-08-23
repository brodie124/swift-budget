import {Component, computed, input, signal} from '@angular/core';
import {FinancialEvent, FinancialEventHistory, FinancialEventOccurrence} from "../../types/financial/financial-event";
import moment from "moment";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {getMomentUtc} from "../../utils/moment-utils";

@Component({
  selector: 'app-event-quick-list',
  templateUrl: './event-quick-list.component.html',
  styleUrls: ['./event-quick-list.component.less']
})
export class EventQuickListComponent {
  public readonly occurrences = input.required<ReadonlyArray<FinancialEventOccurrence>>();
  public readonly startDate = input.required<moment.Moment>();
  public readonly endDate = input.required<moment.Moment>();

  public editBill = signal<FinancialEventOccurrence | undefined>(undefined);
  public showEditBillDialog = computed(() => !!this.editBill());

  public items = computed(() => this.occurrences()
    .map(occurrence => this.createQuickListItem(occurrence))
    .sort((a, b) => compareMomentsAscending(a.nextOccurrence.date, b.nextOccurrence.date)));

  private createQuickListItem(calculatedEvent: FinancialEventOccurrence): EventQuickListItem {
    const comparisonDate = getMomentUtc();
    const timeUntilSeconds = calculatedEvent.date.diff(comparisonDate, 'seconds', false);
    const timeUntilDays = calculatedEvent.date.diff(comparisonDate, 'days', false);

    return {
      history: calculatedEvent.history,
      financialEvent: calculatedEvent.event,
      calculatedEvent: calculatedEvent,
      isOverdue: !calculatedEvent.isPaid && timeUntilSeconds < 0,
      nextOccurrence: {
        date: calculatedEvent.date,
        timeUntil: {
          seconds: timeUntilSeconds,
          days: timeUntilDays
        }
      }
    }
  }
}

export type EventQuickListItem = {
  financialEvent: FinancialEvent;
  calculatedEvent: FinancialEventOccurrence;
  history: FinancialEventHistory;
  isOverdue: boolean;
  nextOccurrence: {
    date: moment.Moment;
    timeUntil: {
      seconds: number;
      days: number;
    }
  },
}

