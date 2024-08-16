import { Injectable } from '@angular/core';
import {FinancialEvent} from "../types/financial/financial-event";

@Injectable({
  providedIn: 'root'
})
export class EventManagerService {
  private readonly _localStorageKey: string = 'sb-recurring-events';

  constructor() { }

  public get(): ReadonlyArray<FinancialEvent> {
    const eventsJson = localStorage.getItem(this._localStorageKey);
    if(!eventsJson)
      return [];

    const events = JSON.parse(eventsJson);
    if(!Array.isArray(events))
      return [];

    return events;
  }

  public add(event: FinancialEvent): void {
    const existingEvents = this.get();
    const newEventList: FinancialEvent[] = [...existingEvents, event];

    const eventsJson = JSON.stringify(newEventList);
    localStorage.setItem(this._localStorageKey, eventsJson);
  }
}
