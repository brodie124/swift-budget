import {inject, Injectable} from '@angular/core';
import {FinancialEventHistoryProvider} from "./financial-event-history-provider.service";
import {FinancialEventHistory, FinancialEventId} from "../types/financial/financial-event";
import moment from "moment";
import {getMomentUtc} from "../utils/moment-utils";

@Injectable({
  providedIn: 'root'
})
export class FinancialEventHistoryManager {
  private readonly _historyProvider: FinancialEventHistoryProvider = inject(FinancialEventHistoryProvider);

  public getHistory(eventUid: FinancialEventId): FinancialEventHistory {
    return this._historyProvider.getOrCreateHistory(eventUid);
  }

  public markPaid(eventUid: FinancialEventId, paidDate?: moment.Moment): void {
    const eventHistory = this._historyProvider.getOrCreateHistory(eventUid);
    eventHistory.lastMarkedPaid = paidDate ?? getMomentUtc();
    eventHistory.lastUpdated = getMomentUtc();

    this._historyProvider.updateHistory(eventHistory);
  }
}
