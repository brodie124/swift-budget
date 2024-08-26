import {inject, Injectable} from '@angular/core';
import {FinancialEventHistoryProvider} from "./financial-event-history-provider.service";
import {FinancialEventHistory, FinancialEventId} from "../types/financial/financial-event";
import moment from "moment";
import {getMomentUtc} from "../utils/moment-utils";
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FinancialEventHistoryManager {
  private readonly _historyProvider: FinancialEventHistoryProvider = inject(FinancialEventHistoryProvider);
  private readonly _historyChangedSubject: Subject<void> = new Subject<void>();
  public get historyChanged$(): Observable<void> {
    return this._historyChangedSubject.asObservable();
  }

  public async getHistoryAsync(eventUid: FinancialEventId): Promise<FinancialEventHistory> {
    return this._historyProvider.getOrCreateHistoryAsync(eventUid);
  }

  public async markPaidAsync(eventUid: FinancialEventId, paidDate?: moment.Moment): Promise<void> {
    const eventHistory = await this._historyProvider.getOrCreateHistoryAsync(eventUid);
    eventHistory.lastMarkedPaid = paidDate?.toISOString() ?? getMomentUtc().toISOString();
    eventHistory.lastUpdated = getMomentUtc().toISOString()

    await this._historyProvider.updateHistoryAsync(eventHistory);
    this._historyChangedSubject.next();
  }
}
