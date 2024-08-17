import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FinancialEvent, FinancialEventHistory} from "../../types/financial/financial-event";
import moment from "moment";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {CalculatedFinancialEvent, FinancialEventService} from "../../services/financial-event.service";
import {FinancialEventHistoryManager} from "../../services/financial-event-history-manager.service";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";

@Component({
  selector: 'app-event-quick-list',
  templateUrl: './event-quick-list.component.html',
  styleUrls: ['./event-quick-list.component.less']
})
export class EventQuickListComponent {

  private readonly _financialEventService: FinancialEventService = inject(FinancialEventService);

  private _items: Array<EventQuickListItem> = [];
  public get items(): ReadonlyArray<EventQuickListItem> {
    return this._items;
  }

  private _events: ReadonlyArray<FinancialEvent> = [];

  @Input()
  public set events(value: ReadonlyArray<FinancialEvent>) {
    this._events = value;
    this.updateQuickList();
  };

  @Input()
  public startDate: moment.Moment = moment.utc(); //.subtract(1, 'month');

  @Input()
  public endDate: moment.Moment = moment.utc().add(3, 'months');

  private updateQuickList(): void {
    const calculatedEvents = this._financialEventService.getCalculatedEvents(this._events, this.startDate, this.endDate);
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

