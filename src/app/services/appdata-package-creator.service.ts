import {inject, Injectable} from '@angular/core';
import {AppdataPackage} from "../types/appdata/appdata-package";
import {EventManagerService} from "./event-manager.service";
import {FinancialEventHistoryProvider} from "./financial-event-history-provider.service";
import {EncryptionService} from "./encryption.service";

@Injectable({
  providedIn: 'root'
})
export class AppdataPackageCreatorService {

  private readonly _eventManager = inject(EventManagerService);
  private readonly _eventHistory = inject(FinancialEventHistoryProvider);
  private readonly _encryption = inject(EncryptionService);

  public async make(): Promise<AppdataPackage> {
    const originUuid = crypto.randomUUID().toString(); // TODO: grab from local storage if available
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

}
