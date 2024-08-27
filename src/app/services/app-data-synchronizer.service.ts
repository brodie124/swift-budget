import {inject, Injectable} from '@angular/core';
import {AuthService} from "./auth.service";
import {filter, firstValueFrom, interval, Observable, of, ReplaySubject, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ApiMediatorService} from "./api-mediator.service";
import {AppdataPackageCreatorService} from "./appdata-package-creator.service";
import {MessageService} from "primeng/api";
import {LocalStorageService} from "./local-storage.service";
import {environment} from "../../environments/environment";
import moment from "moment";
import {getMomentWithTime} from "../utils/moment-utils";
import {AppdataPackage, isAppdataPackage} from "../types/appdata/appdata-package";
import {AppdataConflictBridgeService} from "./appdata-conflict-bridge.service";
import {EncryptionService} from "./encryption.service";
import {PasswordService} from "./password.service";

@Injectable({
  providedIn: 'root'
})
export class AppDataSynchronizerService {
  private readonly _syncCheckInterval = 1000 * 15; // 15 sec sync checks

  private readonly _authService = inject(AuthService);
  private readonly _httpClient = inject(HttpClient);
  private readonly _apiMediator = inject(ApiMediatorService);
  private readonly _appdataConflictBridge = inject(AppdataConflictBridgeService);
  private readonly _appdataPackageCreator = inject(AppdataPackageCreatorService);
  private readonly _encryption = inject(EncryptionService);
  private readonly _passwordService = inject(PasswordService);
  private readonly _messageService = inject(MessageService);

  private readonly _localStorageService = inject(LocalStorageService);

  private _originUuid: string | null = null;
  private _lastSyncMoment: moment.Moment = getMomentWithTime(0);
  private _lastModifiedMoment: moment.Moment = getMomentWithTime(0);

  private _hasFetched: boolean = false;

  private _triggerSyncCheckSubject = new Subject<void>();
  public triggerSyncCheck$ = this._triggerSyncCheckSubject.asObservable();

  private _allowSyncSubject = new ReplaySubject<boolean>(1);
  public allowSync$ = this._allowSyncSubject.asObservable();

  public readonly lastModifiedMoment = this._lastModifiedMoment;


  constructor() {
    this._allowSyncSubject.next(this._localStorageService.getItem(environment.cacheKeys.enableCloudSync) === '1');

    // TODO: move these out of the constructor
    const storedLastModified = this._localStorageService.getItem(environment.cacheKeys.appdataLastModifiedTime);
    if (storedLastModified)
      this._lastModifiedMoment = moment(storedLastModified);

    const storedLastSync = this._localStorageService.getItem(environment.cacheKeys.appdataLastSyncTime);
    if (storedLastSync)
      this._lastSyncMoment = moment(storedLastSync);

    const storedOriginUuid = this._localStorageService.getItem(environment.cacheKeys.appdataOriginUuid);
    if (storedOriginUuid)
      this._originUuid = storedOriginUuid;

    const monitoredLocalStorageKeys = [
      environment.cacheKeys.eventList,
      environment.cacheKeys.eventHistory,
    ];

    this._localStorageService.set$.pipe(filter(e => monitoredLocalStorageKeys.indexOf(e.key) !== -1)).subscribe(() => {
      this._lastModifiedMoment = getMomentWithTime();
      this._localStorageService.setItem(environment.cacheKeys.appdataLastModifiedTime, this._lastModifiedMoment.toISOString());
    });

    this.triggerSyncCheck$.pipe().subscribe(async () => await this.syncCheckAsync());
    interval(this._syncCheckInterval).subscribe(() => this._triggerSyncCheckSubject.next()); // 30 sec sync checks
  }

  public needsSync(): boolean {
    return this._lastModifiedMoment.isAfter(this._lastSyncMoment);
  }

  public async loadAsync(): Promise<Error | 'origin-mismatch' | 'last-modified-mismatch' | 'malformed-data' | 'unauthorized' | 'success'> {
    if (this._appdataConflictBridge.conflictInProgress)
      return new Error('Cannot upload appdata while conflict is in progress');

    const jwt = await firstValueFrom(this._authService.jwt$);
    if (!jwt)
      return new Error('Cannot fetch appdata without auth token!');


    this._messageService.add({
      severity: 'info',
      summary: 'Synchronising...',
      detail: 'Cloud synchronisation is in progress'
    });


    const appdata = await this._apiMediator.fetchAppdata(jwt);
    if (appdata === 'unauthorized')
      return 'unauthorized';

    if (!isAppdataPackage(appdata)) {
      console.log("Malformed appdata");
      const response = await this._appdataConflictBridge.requestConflictResolution({
        type: 'malformed-data',
      });

      console.log("Response from conflict resolution:", response);
      this._hasFetched = true;
      if (response !== 'take-cloud')
        console.warn('Only acceptable conflict resolution for malformed-data is keep-local');

        return 'malformed-data';
    }

    if (appdata.originUuid !== this._originUuid) {
      console.log("Origin mismatch");
      const response = await this._appdataConflictBridge.requestConflictResolution({
        type: 'origin-mismatch',
      });

      console.log("Response from conflict resolution:", response);
      this._hasFetched = true;
      if (response !== 'take-cloud')
        return 'origin-mismatch';
    }

    const packageUploadMoment = getMomentWithTime(appdata.uploadTimestamp);
    if (packageUploadMoment.isBefore(this._lastModifiedMoment)) {
      console.log("Last modified mismatch");
      const response = await this._appdataConflictBridge.requestConflictResolution({
        type: 'last-modified-mismatch',
        localMoment: this._lastModifiedMoment,
        cloudMoment: packageUploadMoment
      });

      console.log("Response from conflict resolution:", response);
      this._hasFetched = true;
      if (response !== 'take-cloud')
        return 'last-modified-mismatch';
    }



    // Check encryption
    if(appdata.isEncrypted) {
      const check = appdata.check ?? '';
      const isCheckValid = this._passwordService.masterPassword && await this._encryption.verifyCheck(this._passwordService.masterPassword, check);
      if(!isCheckValid) {
        this._passwordService.clearMasterPassword();
        localStorage.setItem(environment.cacheKeys.encryptionCheck, check);

        await this._passwordService.waitForUnlock();
      }
    }

    // Update the origin UUID
    this._originUuid = appdata.originUuid;
    this._localStorageService.setItem(environment.cacheKeys.appdataOriginUuid, this._originUuid);

    console.log("Appdata fetch response:", appdata);
    await this.unpackAsync(appdata);

    return 'success';
  }

  private async unpackAsync(appdataPackage: AppdataPackage) {
    await this._appdataPackageCreator.unpackAsync(appdataPackage);
    this._hasFetched = true;

    this._messageService.add({
      severity: 'success',
      summary: 'Synchronisation complete.',
      detail: 'Your cloud save has been downloaded to your device.'
    })
  }

  public async saveAsync() {
    this._messageService.add({
      severity: 'info',
      summary: 'Synchronising...',
      detail: 'Cloud synchronisation is in progress'
    });

    if (this._appdataConflictBridge.conflictInProgress)
      throw new Error('Cannot upload appdata while conflict is in progress');

    const jwt = await firstValueFrom(this._authService.jwt$);
    if (!jwt)
      throw new Error('Cannot save appdata without auth token!');

    const appdataPackage = await this._appdataPackageCreator.make(this._originUuid ?? crypto.randomUUID().toString());
    const result = await this._apiMediator.saveAppdata(jwt, appdataPackage);
    this._originUuid = appdataPackage.originUuid;

    console.log("Upload appdata result:", result);

    if (result === 'success') {

      // TODO: move this out (same for lastModifiedMoment too)
      this._lastSyncMoment = getMomentWithTime();
      this._localStorageService.setItem(environment.cacheKeys.appdataLastSyncTime, this._lastSyncMoment.toISOString());
      this._localStorageService.setItem(environment.cacheKeys.appdataOriginUuid, this._originUuid); // Sync the origin ID too

      this._messageService.add({
        severity: 'success',
        summary: 'Synchronisation complete.',
        detail: 'Your data has been synchronised with Google Drive.'
      });
    } else {
      this._messageService.add({
        severity: 'warn',
        summary: 'Synchronisation failed.',
        detail: 'We were unable to synchronise your data with Google Drive. We\'ll keep trying automatically.'
      });
    }
  }

  public setAllowSync(value: boolean) {
    this._localStorageService.setItem(environment.cacheKeys.enableCloudSync, value ? '1' : '0');
    this._allowSyncSubject.next(value);
  }

  private async syncCheckAsync() {
    const isSyncAllowed = await firstValueFrom(this.allowSync$);
    if (!isSyncAllowed) {
      console.info("Skipping sync - globally disabled");
      return;
    }

    if (!this._hasFetched) {
      console.info("Skipping sync - no fetch has been performed yet");
      return;
    }

    if (this._appdataConflictBridge.conflictInProgress) {
      console.info("Skipping sync - conflict in progress");
      return;
    }

    const isSignedIn = await firstValueFrom(this._authService.isSignedIn$);
    if (!isSignedIn) {
      console.info("Skipping sync - not signed in");
      return;
    }

    if (!this.needsSync()) {
      console.info("Skipping sync - last modified time is before last sync");
      return;
    }

    console.info("Due for sync - syncing");
    this._lastSyncMoment = getMomentWithTime();
    await this.saveAsync() // Do the sync
  }
}
