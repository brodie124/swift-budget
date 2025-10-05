import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  RecurringEventDefinitionProvider
} from "../../services/event-engine-v2/recurring-event-definition-provider.service";
import {
  EventQuickListDateRange
} from "../event-quick-list/subcomponents/event-quick-list-toolbar/event-quick-list-toolbar.component";
import { getMomentUtc } from "../../utils/moment-utils";
import { Subscription } from "rxjs";
import { EventStatisticsService } from "../../services/financial-events/event-statistics.service";
import { RecurringEventDefinition } from "../../services/event-engine-v2/types/recurring-event-definition";
import { EventOccurrence } from "../../services/event-engine-v2/types/event-occurrence";
import { EventOccurrencesManager } from "../../services/event-engine-v2/event-occurrences-manager";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.less' ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly _eventDefinitionProvider: RecurringEventDefinitionProvider = inject(RecurringEventDefinitionProvider);
  private readonly _eventStatisticsService: EventStatisticsService = inject(EventStatisticsService);
  private readonly _eventOccurrencesManager: EventOccurrencesManager = inject(EventOccurrencesManager);
  private readonly _subscriptions: Subscription = new Subscription();

  public occurrences = signal<ReadonlyArray<EventOccurrence>>([]);
  public statistics = computed(() => this._eventStatisticsService.calculateStatistics(this.occurrences()));

  public upcomingOccurrences = computed(() => this.occurrences().filter(e => e.status !== 'paid'));
  public paidOccurrences = computed(() => this.occurrences().filter(e => e.status === 'paid'));

  public quickListDateRange = signal<EventQuickListDateRange>({
    startDate: getMomentUtc(),
    endDate: getMomentUtc().add(1, 'month')
  });

  constructor() {
    effect(async () => {
      this._eventOccurrencesManager.setDateRange(
        this.quickListDateRange().startDate.toDate(),
        this.quickListDateRange().endDate.toDate());
    }, { allowSignalWrites: true }); // Calls to `setDateRange` will trigger `eventOccurrences$` below requiring writing to a signal
  }

  public async ngOnInit() {
    await this._eventDefinitionProvider.loadAsync();
    this._subscriptions.add(this._eventOccurrencesManager.eventOccurrences$.subscribe(occurrences => {
      this.occurrences.set(occurrences);
    }));
  }

  public ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }
}
