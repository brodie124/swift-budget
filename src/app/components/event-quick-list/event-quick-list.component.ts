import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FinancialEvent} from "../../types/financial/financial-event";
import moment from "moment";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {CalculatedFinancialEvent, FinancialEventService} from "../../services/financial-event.service";

@Component({
  selector: 'app-event-quick-list',
  templateUrl: './event-quick-list.component.html',
  styleUrls: ['./event-quick-list.component.less']
})
export class EventQuickListComponent implements OnChanges {

  private readonly _financialEventService: FinancialEventService = inject(FinancialEventService);

  private _items: Array<EventQuickListItem> = [];
  public get items(): ReadonlyArray<EventQuickListItem> {
    return this._items;
  }


  @Input()
  public events: ReadonlyArray<FinancialEvent> = [];
  //   this._calculatedEvents = this._financialEventService.getCalculatedEvents(value, this.startDate, this.endDate);
  //   this._calculatedEvents.sort((a, b) => compareMomentsAscending(a.nextOccurrence?.date, b.nextOccurrence?.date));
  // }

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

  private updateQuickList(): void {
    const calculatedEvents = this._financialEventService.getCalculatedEvents(this.events, this.startDate, this.endDate);
    this._items = calculatedEvents
      .map(this.createQuickListItem)
      .sort((a, b) => compareMomentsAscending(a.nextOccurrence.date, b.nextOccurrence.date));
  }

  private createQuickListItem(calculatedEvent: CalculatedFinancialEvent): EventQuickListItem {
    if(calculatedEvent.occurrences.length <= 0)
      throw new Error('Cannot create quick list item without at least one occurrence!');

    const nextOccurrence = calculatedEvent.occurrences[0];
    const timeUntilSeconds = nextOccurrence.diff(moment(), 'seconds', false);

    return {
      financialEvent: calculatedEvent.event,
      calculatedEvent: calculatedEvent,
      nextOccurrence: {
        date: nextOccurrence,
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
  nextOccurrence: {
    date: moment.Moment;
    timeUntil: {
      seconds: number;
      days: number;
    }
  },
}

