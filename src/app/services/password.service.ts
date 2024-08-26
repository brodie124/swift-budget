import { Injectable } from '@angular/core';
import {firstValueFrom, Subject} from "rxjs";
import {sha256} from "../helpers/hash-utils";

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private _masterPassword: string | null = null;

  private _requireUnlockSubject = new Subject<void>();
  private _onUnlockSubject = new Subject<void>();

  public requireUnlock$ = this._requireUnlockSubject.asObservable();
  public onUnlock$ = this._onUnlockSubject.asObservable();

  public get masterPassword(): string | null {
    return this._masterPassword;
  }

  public async setMasterPassword(input: string): Promise<void> {
    if (!input.trim())
      throw new Error('Master password cannot be empty!');

    this._masterPassword = await sha256(`swift-budget:${input}`);
    this._onUnlockSubject.next();
  }

  public async waitForUnlock(): Promise<void> {
    if(this._masterPassword)
      return;

    this._requireUnlockSubject.next();
    await firstValueFrom(this.onUnlock$);
  }
}
