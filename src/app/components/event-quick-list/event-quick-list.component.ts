import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FinancialEvent, FinancialEventHistory} from "../../types/financial/financial-event";
import moment from "moment";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {CalculatedFinancialEvent, FinancialEventService} from "../../services/financial-event.service";
import {FinancialEventHistoryManager} from "../../services/financial-event-history-manager.service";

@Component({
  selector: 'app-event-quick-list',
  templateUrl: './event-quick-list.component.html',
  styleUrls: ['./event-quick-list.component.less']
})
export class EventQuickListComponent implements OnChanges {

  private readonly _financialEventService: FinancialEventService = inject(FinancialEventService);
  private readonly _financialEventHistoryManager: FinancialEventHistoryManager = inject(FinancialEventHistoryManager);

  private _items: Array<EventQuickListItem> = [];
  public get items(): ReadonlyArray<EventQuickListItem> {
    return this._items;
  }

  @Input()
  public events: ReadonlyArray<FinancialEvent> = [];

  @Input()
  public startDate: moment.Moment = moment.utc(); //.subtract(1, 'month');

  @Input()
  public endDate: moment.Moment = moment.utc().add(3, 'months');

  public ngOnChanges(changes: SimpleChanges): void {
    this.updateQuickList();
  }


  public shouldShowReminderForEvent(event: EventQuickListItem): boolean {
    return !!event.nextOccurrence
      && !event.calculatedEvent.isPaid
      && event.nextOccurrence.timeUntil.days >= 0
      && event.nextOccurrence.timeUntil.days <= 2
  }

  public markAsPaid(item: EventQuickListItem) {
    this._financialEventHistoryManager.markPaid(item.financialEvent.uid);
    this.updateQuickList();
  }

  private updateQuickList(): void {
    const calculatedEvents = this._financialEventService.getCalculatedEvents(this.events, this.startDate, this.endDate);
    this._items = calculatedEvents
      .map(this.createQuickListItem)
      .sort((a, b) => compareMomentsAscending(a.nextOccurrence.date, b.nextOccurrence.date));
  }

  private createQuickListItem(calculatedEvent: CalculatedFinancialEvent): EventQuickListItem {
    const timeUntilSeconds = calculatedEvent.date.diff(moment(), 'seconds', false);

    return {
      history: calculatedEvent.history,
      financialEvent: calculatedEvent.event,
      calculatedEvent: calculatedEvent,
      nextOccurrence: {
        date: calculatedEvent.date,
        timeUntil: {
          seconds: timeUntilSeconds,
          days: timeUntilSeconds / 86400
        }
      }
    }
  }
}

export type EventQuickListItem = {
  financialEvent: FinancialEvent;
  calculatedEvent: CalculatedFinancialEvent;
  history: FinancialEventHistory;
  nextOccurrence: {
    date: moment.Moment;
    timeUntil: {
      seconds: number;
      days: number;
    }
  },
}

