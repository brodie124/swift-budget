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

  public async getHistoryAsync(eventUid: FinancialEventId): Promise<FinancialEventHistory> {
    return this._historyProvider.getOrCreateHistoryAsync(eventUid);
  }

  public async markPaidAsync(eventUid: FinancialEventId, paidDate?: moment.Moment): Promise<void> {
    const eventHistory = await this._historyProvider.getOrCreateHistoryAsync(eventUid);
    eventHistory.lastMarkedPaid = paidDate ?? getMomentUtc();
    eventHistory.lastUpdated = getMomentUtc();

    await this._historyProvider.updateHistoryAsync(eventHistory);
  }
}
