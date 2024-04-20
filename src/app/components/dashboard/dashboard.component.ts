import { Component } from '@angular/core';
import {EventManagerService} from "../../services/event-manager.service";
import {FinancialEvent} from "../../types/financial/financial-event";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent {

  constructor(private readonly _eventManager: EventManagerService) {
  }

  public getEvents(): ReadonlyArray<FinancialEvent> {
    return this._eventManager.get();
  }
}
