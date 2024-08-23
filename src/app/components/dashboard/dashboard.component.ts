import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {EventManagerService} from "../../services/event-manager.service";
import {FinancialEvent, FinancialEventOccurrence} from "../../types/financial/financial-event";
import {
  EventQuickListDateRange
} from "../event-quick-list/subcomponents/event-quick-list-toolbar/event-quick-list-toolbar.component";
import {getMomentUtc} from "../../utils/moment-utils";
import {Subscription} from "rxjs";
import {FinancialEventService} from "../../services/financial-event.service";
import {FinancialEventHistoryManager} from "../../services/financial-event-history-manager.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly _eventManager: EventManagerService = inject(EventManagerService);
  private readonly _financialEventService: FinancialEventService = inject(FinancialEventService);
  private readonly _financialEventHistoryManager: FinancialEventHistoryManager = inject(FinancialEventHistoryManager);
  private readonly _subscriptions: Subscription = new Subscription();

  public events = signal<ReadonlyArray<FinancialEvent>>([]);
  public occurrences = signal<ReadonlyArray<FinancialEventOccurrence>>([]);

  public quickListDateRange = signal<EventQuickListDateRange>({
    startDate: getMomentUtc(),
    endDate: getMomentUtc().add(1, 'month')
  });



  public async ngOnInit() {
    await this._eventManager.loadAsync();
    this._subscriptions.add(this._eventManager.events$.subscribe(events => {
      this.events.set(events);
      this.calculateOccurrences(this.events());
    }));

    this._subscriptions.add(this._financialEventHistoryManager.historyChanged$.subscribe(() => {
      this.calculateOccurrences(this.events());
    }));
  }

  public ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  private async calculateOccurrences(events: ReadonlyArray<FinancialEvent>) {
    const eventOccurrences = await this._financialEventService.getCalculatedEventsAsync(
      events,
      this.quickListDateRange().startDate,
      this.quickListDateRange().endDate
    );

    this.occurrences.set(eventOccurrences);
  }
}
