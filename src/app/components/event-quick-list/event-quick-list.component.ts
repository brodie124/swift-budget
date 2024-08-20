import {Component, computed, inject, input} from '@angular/core';
import {FinancialEvent, FinancialEventHistory, FinancialEventOccurrence} from "../../types/financial/financial-event";
import moment from "moment";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {FinancialEventService} from "../../services/financial-event.service";
import {getMomentUtc} from "../../utils/moment-utils";
import {toObservable} from "@angular/core/rxjs-interop";
import {from, map, switchMap} from "rxjs";

@Component({
  selector: 'app-event-quick-list',
  templateUrl: './event-quick-list.component.html',
  styleUrls: ['./event-quick-list.component.less']
})
export class EventQuickListComponent {

  private readonly _financialEventService: FinancialEventService = inject(FinancialEventService);

  public readonly events = input.required<ReadonlyArray<FinancialEvent>>();
  public readonly startDate = input.required<moment.Moment>();
  public readonly endDate = input.required<moment.Moment>();

  public itemsPromise = computed(() => this._financialEventService.getCalculatedEventsAsync(this.events(), this.startDate(), this.endDate()));
  public items$ = toObservable(this.itemsPromise).pipe(
    switchMap(e => from(e)), map(calculatedEvents => calculatedEvents
    .map(this.createQuickListItem)
    .sort((a: any, b: any) => compareMomentsAscending(a.nextOccurrence.date, b.nextOccurrence.date))
  ));


  private createQuickListItem(calculatedEvent: FinancialEventOccurrence): EventQuickListItem {
    const timeUntilSeconds = calculatedEvent.date.diff(getMomentUtc(), 'seconds', false);

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
  calculatedEvent: FinancialEventOccurrence;
  history: FinancialEventHistory;
  nextOccurrence: {
    date: moment.Moment;
    timeUntil: {
      seconds: number;
      days: number;
    }
  },
}

