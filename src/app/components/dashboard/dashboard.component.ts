import {Component, effect, OnDestroy, OnInit, signal} from '@angular/core';
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
  private readonly _subscriptions: Subscription = new Subscription();

  public events: ReadonlyArray<FinancialEvent> = [];
  public quickListDateRange = signal<EventQuickListDateRange>({
    startDate: getMomentUtc(),
    endDate: getMomentUtc().add(1, 'month')
  });

  constructor(private readonly _eventManager: EventManagerService) {
    // this._eventManager.events$.subscribe()

    // effect(async () => {
    //   this.quickListDateRange();
    //   this.events = await this._eventManager.getAsync();
    // });
  }

  public ngOnInit() {
    this._subscriptions.add(this._eventManager.events$.subscribe(events => {
      this.events = events;
    }));
  }

  public ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }
}
