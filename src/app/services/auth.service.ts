import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private _isSignedInSubject = new Subject<boolean>();
  //
  //
  // public isSignedIn$: Observable<boolean> = this._isSignedInSubject.asObservable();


  public async signInAsync() {
    window.location.href = environment.oauthInitUrl;
  }

  public async signOutAsync() {

  }
}
