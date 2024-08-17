import {Component, signal} from '@angular/core';
import {EventManagerService} from "../../services/event-manager.service";
import {FinancialEvent} from "../../types/financial/financial-event";
import {
  EventQuickListDateRange
} from "../event-quick-list/subcomponents/event-quick-list-toolbar/event-quick-list-toolbar.component";
import {getMomentUtc} from "../../utils/moment-utils";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent {
  public quickListDateRange = signal<EventQuickListDateRange>({
    startDate: getMomentUtc(),
    endDate: getMomentUtc().add(1, 'month')
  });

  constructor(private readonly _eventManager: EventManagerService) {
  }

  public getEvents(): ReadonlyArray<FinancialEvent> {
    return this._eventManager.get();
  }
}
