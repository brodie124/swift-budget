import {inject, Injectable} from '@angular/core';
import {FinancialEventHistory, FinancialEventId} from "../types/financial/financial-event";
import {getMomentUtc} from "../utils/moment-utils";
import {environment} from "../../environments/environment";
import {EncryptedLocalStorageService} from "./encrypted-local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class FinancialEventHistoryProvider {
  private readonly _encryptedLocalStorage = inject(EncryptedLocalStorageService);
  private _cachedHistories: Array<FinancialEventHistory> | null = null;


  public async getOrCreateHistoryAsync(uid: FinancialEventId): Promise<FinancialEventHistory> {
    const history = await this.getHistoryAsync(uid);
    if (history)
      return history;

    return {
      eventUid: uid,
      lastUpdated: getMomentUtc(),
    };
  }

  public async getHistoryAsync(uid: FinancialEventId): Promise<FinancialEventHistory | null> {
    const histories = await this.getHistoriesAsync();
    return histories.find(e => e.eventUid === uid) ?? null;
  }


  public async getHistoriesAsync(): Promise<Array<FinancialEventHistory>> {
    if (this._cachedHistories)
      return [...this._cachedHistories];

    const historiesJson = await this._encryptedLocalStorage.getItemAsync(environment.cacheKeys.eventHistory);
    if (!historiesJson) {
      console.info('Could not financial event history JSON');
      return [];
    }

    const parsedHistories = JSON.parse(historiesJson) as Array<FinancialEventHistory> | null | undefined;
    if (!parsedHistories)
      console.error('Could not parse financial event history JSON');

    const updatedParsedHistories = parsedHistories?.map(e => {
      if (e.lastUpdated)
        e.lastUpdated = getMomentUtc(e.lastUpdated);

      if (e.lastMarkedPaid)
        e.lastMarkedPaid = getMomentUtc(e.lastMarkedPaid);

      return e;
    });

    this._cachedHistories = updatedParsedHistories ?? this._cachedHistories ?? [];
    return [...this._cachedHistories!];
  }

  public async updateHistories(eventHistories: Array<FinancialEventHistory>): Promise<void> {
    this._cachedHistories = [...eventHistories];
    const historiesJson = JSON.stringify(eventHistories);
    await this._encryptedLocalStorage.setItemAsync(environment.cacheKeys.eventHistory, historiesJson);
  }

  public async updateHistoryAsync(history: FinancialEventHistory): Promise<void> {
    const originalHistories = await this.getHistoriesAsync();
    const otherHistories = originalHistories.filter(e => e.eventUid !== history.eventUid);
    const newHistories = [...otherHistories, history];
    const newHistoriesJson = JSON.stringify(newHistories);

    this._cachedHistories = newHistories;
    await this._encryptedLocalStorage.setItemAsync(environment.cacheKeys.eventHistory, newHistoriesJson);
  }
}
