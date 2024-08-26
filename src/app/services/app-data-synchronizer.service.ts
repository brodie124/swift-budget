import {inject, Injectable} from '@angular/core';
import {AuthService} from "./auth.service";
import {firstValueFrom} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ApiMediatorService} from "./api-mediator.service";
import {AppdataPackageCreatorService} from "./appdata-package-creator.service";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class AppDataSynchronizerService {
  private readonly _authService = inject(AuthService);
  private readonly _httpClient = inject(HttpClient);
  private readonly _apiMediator = inject(ApiMediatorService);
  private readonly _appdataPackageCreator = inject(AppdataPackageCreatorService);
  private readonly _messageService = inject(MessageService);

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

    const appdataPackage = await this._appdataPackageCreator.make();
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
}
