import {Component, computed, inject, input, OnDestroy, OnInit, signal, Signal} from '@angular/core';
import {FinancialEvent, FinancialEventHistory, FinancialEventOccurrence} from "../../types/financial/financial-event";
import moment from "moment";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {FinancialEventService} from "../../services/financial-event.service";
import {getMomentUtc} from "../../utils/moment-utils";
import {toObservable} from "@angular/core/rxjs-interop";
import {from, map, Subscription, switchMap} from "rxjs";
import {FinancialEventHistoryManager} from "../../services/financial-event-history-manager.service";

@Component({
  selector: 'app-event-quick-list',
  templateUrl: './event-quick-list.component.html',
  styleUrls: ['./event-quick-list.component.less']
})
export class EventQuickListComponent implements OnInit, OnDestroy {
  private readonly _financialEventService: FinancialEventService = inject(FinancialEventService);
  private readonly _financialEventHistoryService: FinancialEventHistoryManager = inject(FinancialEventHistoryManager);
  private readonly _subscriptions: Subscription = new Subscription();
  public readonly triggerRecompute = signal<boolean>(false);

  public readonly events = input.required<ReadonlyArray<FinancialEvent>>();
  public readonly startDate = input.required<moment.Moment>();
  public readonly endDate = input.required<moment.Moment>();

  public itemsPromise = computed(() => {
    this.triggerRecompute(); // Here as a trigger
    return this._financialEventService.getCalculatedEventsAsync(this.events(), this.startDate(), this.endDate())
  });
  public items$ = toObservable(this.itemsPromise).pipe(
    switchMap(e => from(e)), map(calculatedEvents => calculatedEvents
      .map(this.createQuickListItem)
      .sort((a: any, b: any) => compareMomentsAscending(a.nextOccurrence.date, b.nextOccurrence.date))
    ));


  public ngOnInit(): void {
    this._financialEventHistoryService.historyChanged$.subscribe(
      () => this.triggerRecompute.set(!this.triggerRecompute())
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }


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

