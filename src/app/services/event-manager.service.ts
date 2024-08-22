import {inject, Injectable} from '@angular/core';
import {FinancialEvent} from "../types/financial/financial-event";
import {environment} from "../../environments/environment";
import {EncryptedLocalStorageService} from "./encrypted-local-storage.service";
import {firstValueFrom, Observable, ReplaySubject, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EventManagerService {
  private readonly _encryptedStorageService = inject(EncryptedLocalStorageService);

  private _eventsSubject: Subject<ReadonlyArray<FinancialEvent>> = new ReplaySubject<ReadonlyArray<FinancialEvent>>(1);
  public events$: Observable<ReadonlyArray<FinancialEvent>> = this._eventsSubject.asObservable();

  constructor() {
    this.events$.subscribe(async (events)  => await this.saveAsync(events));
  }

  public async getAsync(): Promise<ReadonlyArray<FinancialEvent>> {
    return await firstValueFrom(this.events$)
  }

  public async loadAsync(): Promise<ReadonlyArray<FinancialEvent>> {
    const eventsJson = await this._encryptedStorageService.getItemAsync(environment.cacheKeys.eventList);
    let events: Array<FinancialEvent> = [];
    if(eventsJson) {
      events = JSON.parse(eventsJson);
      if (!Array.isArray(events))
        events = [];
    }

    this._eventsSubject.next(events);
    return events;
  }

  public async addAsync(event: FinancialEvent): Promise<void> {
    const existingEvents = await this.getAsync();
    const newEventList: FinancialEvent[] = [...existingEvents, event];

    await this.saveAsync(newEventList);
    this._eventsSubject.next(newEventList);
  }

  /**
   * Removes an event by its uid
   * @return {boolean} true if 1+ events were removed
   */
  public async removeAsync(eventUid: string): Promise<boolean> {
    const existingEvents = await this.getAsync();
    const filteredEvents = existingEvents.filter(event => event.uid !== eventUid);

    await this.saveAsync(filteredEvents);
    this._eventsSubject.next(filteredEvents);

    return filteredEvents.length < existingEvents.length;
  }

  private async saveAsync(events: ReadonlyArray<FinancialEvent>): Promise<void> {
    const eventsJson = JSON.stringify(events);
    await this._encryptedStorageService.setItemAsync(environment.cacheKeys.eventList, eventsJson);
  }
}
