import {inject, Injectable} from '@angular/core';
import {FinancialEventHistoryProvider} from "./financial-event-history-provider.service";
import {FinancialEventId} from "../types/financial/financial-event";
import moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class FinancialEventHistoryManager {
  private readonly _historyProvider: FinancialEventHistoryProvider = inject(FinancialEventHistoryProvider);

  public markPaid(eventUid: FinancialEventId): void {
    const eventHistory = this._historyProvider.getOrCreateHistory(eventUid);
    eventHistory.lastMarkedPaid = moment();
    eventHistory.lastUpdated = moment();

    this._historyProvider.updateHistory(eventHistory);
  }
}
