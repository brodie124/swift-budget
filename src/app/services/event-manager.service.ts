import { Injectable } from '@angular/core';
import {FinancialEvent} from "../types/financial/financial-event";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class EventManagerService {
  private readonly _localStorageKey: string = 'sb-recurring-events';

  constructor() { }

  public get(): ReadonlyArray<FinancialEvent> {
    const eventsJson = localStorage.getItem(environment.cacheKeys.eventList);
    if(!eventsJson)
      return [];

    const events = JSON.parse(eventsJson);
    if(!Array.isArray(events))
      return [];

    return events;
  }

  public add(event: FinancialEvent): void {
    let existingEvents = this.get();

    // TODO: remove me!
    existingEvents = existingEvents.map(e => {
      e.uid ??= crypto.randomUUID().replace('-', '');
      return e;
    })

    const newEventList: FinancialEvent[] = [...existingEvents, event];

    const eventsJson = JSON.stringify(newEventList);
    localStorage.setItem(environment.cacheKeys.eventList, eventsJson);
  }
}
