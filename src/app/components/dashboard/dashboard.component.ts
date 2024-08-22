import {Component, effect, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {EventManagerService} from "../../services/event-manager.service";
import {FinancialEvent} from "../../types/financial/financial-event";
import {
  EventQuickListDateRange
} from "../event-quick-list/subcomponents/event-quick-list-toolbar/event-quick-list-toolbar.component";
import {getMomentUtc} from "../../utils/moment-utils";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly _eventManager: EventManagerService = inject(EventManagerService);
  private readonly _subscriptions: Subscription = new Subscription();

  public events = signal<ReadonlyArray<FinancialEvent>>([]);
  public quickListDateRange = signal<EventQuickListDateRange>({
    startDate: getMomentUtc(),
    endDate: getMomentUtc().add(1, 'month')
  });

  public async ngOnInit() {
    await this._eventManager.loadAsync();
    this._subscriptions.add(this._eventManager.events$.subscribe(events => {
      this.events.set(events);
    }));
  }

  public ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }
}
