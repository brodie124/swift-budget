import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ApiMediatorService} from "./api-mediator.service";
import {Subject, Observable, ReplaySubject, startWith} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _jwtCacheKey = 'sbasat';
  private readonly _httpClient = inject(HttpClient);
  private readonly _apiMediator = inject(ApiMediatorService);

  private _isSignedInSubject = new ReplaySubject<boolean>(1);
  public isSignedIn$: Observable<boolean> = this._isSignedInSubject.asObservable().pipe(startWith(false));

  public initialize() {
    // TODO: call the api to check the JWT (but rate limit it)
    const localStorageJwt = localStorage.getItem(this._jwtCacheKey);
    this._isSignedInSubject.next(!!localStorageJwt);
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

    localStorage.setItem(this._jwtCacheKey, jwt);
    this._isSignedInSubject.next(true);
    return 'success';
  }


  public async signOutAsync() {
    // TODO: call the api to revoke the token
    localStorage.removeItem(this._jwtCacheKey);
    this._isSignedInSubject.next(false);
  }
}
