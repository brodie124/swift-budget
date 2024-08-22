import {inject, Injectable} from '@angular/core';
import {FinancialEvent} from "../types/financial/financial-event";
import {environment} from "../../environments/environment";
import {EncryptedLocalStorageService} from "./encrypted-local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class EventManagerService {
  private readonly _encryptedStorageService = inject(EncryptedLocalStorageService);

  public async getAsync(): Promise<ReadonlyArray<FinancialEvent>> {
    const eventsJson = await this._encryptedStorageService.getItemAsync(environment.cacheKeys.eventList);
    if(!eventsJson)
      return [];

    const events = JSON.parse(eventsJson);
    if(!Array.isArray(events))
      return [];

    return events;
  }

  public async addAsync(event: FinancialEvent): Promise<void> {
    const existingEvents = await this.getAsync();
    const newEventList: FinancialEvent[] = [...existingEvents, event];

    const eventsJson = JSON.stringify(newEventList);
    await this._encryptedStorageService.setItemAsync(environment.cacheKeys.eventList, eventsJson);
  }
}
