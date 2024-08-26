import {inject, Injectable} from '@angular/core';
import {AuthService} from "./auth.service";
import {firstValueFrom} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ApiMediatorService} from "./api-mediator.service";

@Injectable({
  providedIn: 'root'
})
export class AppDataSynchronizerService {
  private readonly _authService = inject(AuthService);
  private readonly _httpClient = inject(HttpClient);
  private readonly _apiMediator = inject(ApiMediatorService);

  public async loadAsync() {

    const jwt = await firstValueFrom(this._authService.jwt$);
    if(!jwt)
      throw new Error('Cannot fetch appdata without auth token!');

    const appdata = await this._apiMediator.fetchAppdata<any>(jwt);
    console.log("Appdata fetch response:", appdata);
  }
}
