import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ApiMediatorService} from "./api-mediator.service";
import {Subject, Observable, ReplaySubject, startWith, map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _apiMediator = inject(ApiMediatorService);

  private _jwtSubject = new ReplaySubject<string | null>(1);

  public jwt$: Observable<string | null> = this._jwtSubject.asObservable();
  public isSignedIn$: Observable<boolean> = this.jwt$.pipe(map(jwt => !!jwt));


  public initialize() {
    // TODO: call the api to check the JWT (but rate limit it)
    const localStorageJwt = localStorage.getItem(environment.cacheKeys.apiAccessToken) ?? null;
    this._jwtSubject.next(localStorageJwt);
  }

  public async startSignInAsync() {
    window.location.href = this._apiMediator.oauthInitUrl;
  }

  public async completeSignInAsync(fetchCode: string): Promise<'success' | 'failure'> {
    const jwt = await this._apiMediator.fetchJwtAsync(fetchCode);
    if(jwt instanceof Error) {
      return 'failure';
    }

    if(!jwt) {
      return 'failure';
    }

    localStorage.setItem(environment.cacheKeys.apiAccessToken, jwt);
    this._jwtSubject.next(jwt);
    return 'success';
  }


  public async signOutAsync() {
    // TODO: call the api to revoke the token
    localStorage.removeItem(environment.cacheKeys.apiAccessToken);
    this._jwtSubject.next(null);
  }
}
