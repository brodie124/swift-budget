import { Injectable } from '@angular/core';
import {FinancialEventHistory, FinancialEventId} from "../types/financial/financial-event";
import moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class FinancialEventHistoryProvider {
  private readonly _localStorageKey: string = 'sb-event-history';

  private _cachedHistories: Array<FinancialEventHistory> | null = null;


  public getOrCreateHistory(uid: FinancialEventId): FinancialEventHistory {
    const history = this.getHistory(uid);
    if (history)
      return history;

    return {
      eventUid: uid,
      lastUpdated: moment(),
    };
  }

  public getHistory(uid: FinancialEventId): FinancialEventHistory | null {
    const histories = this.getHistories();
    return histories.find(e => e.eventUid === uid) ?? null;
  }


  public getHistories(): Array<FinancialEventHistory> {
    if (this._cachedHistories)
      return [...this._cachedHistories];

    const historiesJson = localStorage.getItem(this._localStorageKey);
    if (!historiesJson) {
      console.info('Could not financial event history JSON');
      return [];
    }

    const parsedHistories = JSON.parse(historiesJson) as Array<FinancialEventHistory> | null | undefined;
    if (!parsedHistories)
      console.error('Could not parse financial event history JSON');

    const updatedParsedHistories = parsedHistories?.map(e => {
      if (e.lastUpdated)
        e.lastUpdated = moment(e.lastUpdated);

      if (e.lastMarkedPaid)
        e.lastMarkedPaid = moment(e.lastMarkedPaid);

      return e;
    });

    this._cachedHistories = updatedParsedHistories ?? this._cachedHistories ?? [];
    return [...this._cachedHistories!];
  }

  public updateHistories(eventHistories: Array<FinancialEventHistory>) {
    this._cachedHistories = [...eventHistories];
    const historiesJson = JSON.stringify(eventHistories);
    localStorage.setItem(this._localStorageKey, historiesJson);
  }

  public updateHistory(history: FinancialEventHistory) {
    const otherHistories = this.getHistories().filter(e => e.eventUid !== history.eventUid);
    const newHistories = [...otherHistories, history];
    const newHistoriesJson = JSON.stringify(newHistories);

    this._cachedHistories = newHistories;
    localStorage.setItem(this._localStorageKey, newHistoriesJson);
  }
}
