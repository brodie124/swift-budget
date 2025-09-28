import {inject, Injectable} from '@angular/core';
import {AppdataPackage} from "../../types/appdata/appdata-package";
import {RecurringEventDefinitionProvider} from "../event-engine-v2/recurring-event-definition-provider.service";
import {EncryptionService} from "../storage/encryption.service";
import {environment} from "../../../environments/environment";
import {LocalStorageService} from "../storage/local-storage.service";
import {getMomentWithTime} from "../../utils/moment-utils";

@Injectable({
  providedIn: 'root'
})
export class AppdataPackageCreatorService {

  private readonly _eventDefinitionProvider = inject(RecurringEventDefinitionProvider);
  private readonly _encryption = inject(EncryptionService);
  private readonly _localStorageService = inject(LocalStorageService);

  public async make(originUuid: string): Promise<AppdataPackage> {
    const uploadTimestamp = Date.now();

    const events = await this._eventDefinitionProvider.getAsync();
    const encryptionPreference = this._encryption.isRequested();
    const check = await this._encryption.getCheckAsync();

    return {
      isEncrypted: !!check,
      check: check ?? undefined,
      originUuid,
      uploadTimestamp,

      eventList: events,
      encryptionPreference: encryptionPreference
    }
  }

  public async unpackAsync(appdata: AppdataPackage, override?: boolean) {
    const uploadedMoment = getMomentWithTime(appdata.uploadTimestamp);
    await this._eventDefinitionProvider.setEventsAsync(appdata.eventList);
    this._localStorageService.setItem(environment.cacheKeys.appdataOriginUuid, appdata.originUuid);
    this._localStorageService.setItem(environment.cacheKeys.encryptionPreference, appdata.encryptionPreference ? '1' : '0');
    this._localStorageService.setItem(environment.cacheKeys.appdataLastModifiedTime, uploadedMoment.toISOString());
  }

}
