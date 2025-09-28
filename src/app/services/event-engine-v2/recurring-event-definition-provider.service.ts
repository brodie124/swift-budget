import {inject, Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {EncryptedLocalStorageService} from "../storage/encrypted-local-storage.service";
import {firstValueFrom, Observable, ReplaySubject, Subject} from "rxjs";
import {RecurringEventDefinition} from "./types/recurring-event-definition";

@Injectable({
  providedIn: 'root'
})
export class RecurringEventDefinitionProvider {
  private readonly _encryptedStorageService = inject(EncryptedLocalStorageService);

  private _eventsSubject: Subject<ReadonlyArray<RecurringEventDefinition>> = new ReplaySubject<ReadonlyArray<RecurringEventDefinition>>(1);
  public events$: Observable<ReadonlyArray<RecurringEventDefinition>> = this._eventsSubject.asObservable();

  public async getAsync(): Promise<ReadonlyArray<RecurringEventDefinition>> {
    return await firstValueFrom(this.events$)
  }

  public async setEventsAsync(events: ReadonlyArray<RecurringEventDefinition>) {
    await this.saveAsync(events);
    return events;
  }

  public async loadAsync(): Promise<ReadonlyArray<RecurringEventDefinition>> {
    const eventsJson = await this._encryptedStorageService.getItemAsync(environment.cacheKeys.eventList);
    let events: Array<RecurringEventDefinition> = [];
    if(eventsJson) {
      events = JSON.parse(eventsJson);
      if (!Array.isArray(events))
        events = [];
    }

    this._eventsSubject.next(events);
    return events;
  }

  public async addAsync(event: RecurringEventDefinition): Promise<void> {
    const existingEvents = await this.getAsync();
    const newEventList: Array<RecurringEventDefinition> = [...existingEvents, event];

    await this.saveAsync(newEventList);
  }

  public async updateAsync(updatedEvent: RecurringEventDefinition): Promise<void> {
    const existingEvents = await this.getAsync();
    const filteredEvents = existingEvents.filter(e => e.id !== updatedEvent.id);

    const newEvents = [...filteredEvents, updatedEvent];
    await this.saveAsync(newEvents);
  }

  /**
   * Removes an event by its uid
   * @return {boolean} true if 1+ events were removed
   */
  public async removeAsync(eventUid: string): Promise<boolean> {
    const existingEvents = await this.getAsync();
    const filteredEvents = existingEvents.filter(event => event.id !== eventUid);

    await this.saveAsync(filteredEvents);
    return filteredEvents.length < existingEvents.length;
  }

  private async saveAsync(events: ReadonlyArray<RecurringEventDefinition>): Promise<void> {
    const eventsJson = JSON.stringify(events);
    await this._encryptedStorageService.setItemAsync(environment.cacheKeys.eventList, eventsJson);

    this._eventsSubject.next(events);
  }
}
