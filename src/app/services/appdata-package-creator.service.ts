import {inject, Injectable} from '@angular/core';
import {AppdataPackage} from "../types/appdata/appdata-package";
import {EventManagerService} from "./event-manager.service";
import {FinancialEventHistoryProvider} from "./financial-event-history-provider.service";
import {EncryptionService} from "./encryption.service";
import {environment} from "../../environments/environment";
import {LocalStorageService} from "./local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class AppdataPackageCreatorService {

  private readonly _eventManager = inject(EventManagerService);
  private readonly _eventHistory = inject(FinancialEventHistoryProvider);
  private readonly _encryption = inject(EncryptionService);
  private readonly _localStorageService = inject(LocalStorageService);

  public async make(originUuid: string): Promise<AppdataPackage> {
    const uploadTimestamp = Date.now();

    const events = await this._eventManager.getAsync();
    const history = await this._eventHistory.getHistoriesAsync();
    const encryptionPreference = this._encryption.isRequested();

    return {
      originUuid,
      uploadTimestamp,

      eventList: events,
      eventHistory: history,
      encryptionPreference: encryptionPreference

    }
  }

  public async unpackAsync(appdata: AppdataPackage, override?: boolean) {
    await this._eventManager.setEventsAsync(appdata.eventList);
    await this._eventHistory.updateHistories([...appdata.eventHistory]);
    this._localStorageService.setItem(environment.cacheKeys.encryptionPreference, appdata.encryptionPreference ? '1' : '0');
  }

}
