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

@Injectable({
  providedIn: 'root'
})
export class AppDataSynchronizerService {
  private readonly _syncCheckInterval = 1000;// 1000 * 30; // 30 sec sync checks

  private readonly _authService = inject(AuthService);
  private readonly _httpClient = inject(HttpClient);
  private readonly _apiMediator = inject(ApiMediatorService);
  private readonly _appdataPackageCreator = inject(AppdataPackageCreatorService);
  private readonly _messageService = inject(MessageService);

  private readonly _localStorageService = inject(LocalStorageService);

  private _originUuid: string = crypto.randomUUID();
  private _lastSyncMoment: moment.Moment = getMomentWithTime(0);
  private _lastModifiedMoment: moment.Moment = getMomentWithTime(0);

  private _triggerSyncCheckSubject = new Subject<void>();
  public triggerSyncCheck$ = this._triggerSyncCheckSubject.asObservable();

  private _allowSyncSubject = new ReplaySubject<boolean>(1);
  public allowSync$ = this._allowSyncSubject.asObservable();

  constructor() {
    this._allowSyncSubject.next(false);

    // TODO: move these out of the constructor
    const storedLastModified = this._localStorageService.getItem(environment.cacheKeys.appdataLastModifiedTime);
    if(storedLastModified)
      this._lastModifiedMoment = moment(storedLastModified);

    const storedLastSync = this._localStorageService.getItem(environment.cacheKeys.appdataLastSyncTime);
    if(storedLastSync)
      this._lastSyncMoment = moment(storedLastSync);

    const storedOriginUuid = this._localStorageService.getItem(environment.cacheKeys.appdataOriginUuid);
    if(storedOriginUuid)
      this._originUuid = storedOriginUuid;

    const monitoredLocalStorageKeys = [
      environment.cacheKeys.eventList,
      environment.cacheKeys.eventHistory,
    ];

    this._localStorageService.set$.pipe(filter(e => monitoredLocalStorageKeys.indexOf(e.key) !== -1)).subscribe(() => {
      this._lastModifiedMoment = getMomentWithTime();
      this._localStorageService.setItem(environment.cacheKeys.appdataLastSyncTime, this._lastModifiedMoment.toISOString());
    });

    this.triggerSyncCheck$.pipe().subscribe(async () => await this.syncCheckAsync());
    interval(this._syncCheckInterval).subscribe(() => this._triggerSyncCheckSubject.next()); // 30 sec sync checks
  }

  public needsSync(): boolean {
    return this._lastModifiedMoment.isAfter(this._lastSyncMoment);
  }

  public async loadAsync() {
    const jwt = await firstValueFrom(this._authService.jwt$);
    if (!jwt)
      throw new Error('Cannot fetch appdata without auth token!');

    const appdata = await this._apiMediator.fetchAppdata<any>(jwt);
    console.log("Appdata fetch response:", appdata);
  }

  public async saveAsync() {
    const jwt = await firstValueFrom(this._authService.jwt$);
    if (!jwt)
      throw new Error('Cannot save appdata without auth token!');

    const appdataPackage = await this._appdataPackageCreator.make(this._originUuid);
    const result = await this._apiMediator.saveAppdata(jwt, appdataPackage);
    console.log("Upload appdata result:", result);

    if (result === 'success') {
      this._messageService.add({
        severity: 'success',
        summary: 'Synchronisation complete.',
        detail: 'Your data has been synchronised with Google Drive.'
      });
    } else {
      this._messageService.add({
        severity: 'error',
        summary: 'Synchronisation failed.',
        detail: 'We were unable to synchronise your data with Google Drive. We\'ll keep trying automatically.'
      });
    }
  }

  public setAllowSync(value: boolean) {
    this._allowSyncSubject.next(value);
  }

  private async syncCheckAsync() {
    const isSyncAllowed = await firstValueFrom(this.allowSync$);
    if(!isSyncAllowed) {
      console.info("Skipping sync - globally disabled");
      return;
    }

    const isSignedIn = await firstValueFrom(this._authService.isSignedIn$);
    if(!isSignedIn) {
      console.info("Cancelling sync check - not signed in");
      return;
    }

    if(!this.needsSync()) {
      console.info("Last modified before last sync - no need to sync");
      return;
    }

    console.info("Due for sync - syncing");
    this._lastSyncMoment = getMomentWithTime();
    // await this.saveAsync() // Do the sync
  }
}
