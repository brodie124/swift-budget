import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {ApiMediatorService} from "./api-mediator.service";
import {map, Observable, ReplaySubject} from "rxjs";
import {LocalStorageService} from "./local-storage.service";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _messageService = inject(MessageService);
  private readonly _apiMediator = inject(ApiMediatorService);
  private readonly _localStorageService = inject(LocalStorageService);

  private _jwtSubject = new ReplaySubject<string | null>(1);

  public jwt$: Observable<string | null> = this._jwtSubject.asObservable();
  public isSignedIn$: Observable<boolean> = this.jwt$.pipe(map(jwt => !!jwt));


  public initialize() {
    // TODO: call the api to check the JWT (but rate limit it)
    const localStorageJwt = this._localStorageService.getItem(environment.cacheKeys.apiAccessToken) ?? null;
    this._jwtSubject.next(localStorageJwt);

    this._apiMediator.notifyUnauthorized$.subscribe(async () => {
      await this.signOutAsync()
      this._messageService.add({
        severity: 'error',
        summary: 'Cloud synchronisation paused.',
        detail: 'You have been signed out. To re-enable cloud synchronisation, please sign back in again.',
        closable: true,
        sticky: true
      });
    })
  }

  public async startSignInAsync() {
    window.location.href = this._apiMediator.oauthInitUrl;
  }

  public async completeSignInAsync(fetchCode: string): Promise<'success' | 'failure'> {
    const jwt = await this._apiMediator.fetchJwtAsync(fetchCode);
    if(jwt instanceof Error) {
      return 'failure';
    }

    if(!jwt || jwt === 'unauthorized') {
      return 'failure';
    }

    this._localStorageService.setItem(environment.cacheKeys.apiAccessToken, jwt);
    this._jwtSubject.next(jwt);
    return 'success';
  }


  public async signOutAsync() {
    // TODO: call the api to revoke the token
    this._localStorageService.removeItem(environment.cacheKeys.apiAccessToken);
    this._jwtSubject.next(null);
  }
}
