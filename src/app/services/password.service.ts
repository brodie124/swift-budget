import {inject, Injectable} from '@angular/core';
import {firstValueFrom, Subject} from "rxjs";
import {sha256} from "../helpers/hash-utils";
import {BiometricAuthService} from "./biometric-auth.service";

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private readonly _bioAuthService = inject(BiometricAuthService);
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

  public clearMasterPassword() {
    this._masterPassword = null;
  }

  public async waitForUnlock(): Promise<string> {
    if (this._masterPassword)
      return this.masterPassword!;

    this._requireUnlockSubject.next();
    void this.triggerBiometricUnlockAsync(); // Trigger biometric auth in case it's available.
    await firstValueFrom(this.onUnlock$);

    return this.masterPassword!;
  }

  private async triggerBiometricUnlockAsync(): Promise<void> {
    if (!this._bioAuthService.isSupported())
      return;

    const isBioAuthRegistered = this._bioAuthService.isRegistered();
    if (!isBioAuthRegistered)
      return;

    const masterPassword = await this._bioAuthService.loadData('mu');
    if (!masterPassword) {
      console.error('Failed to unlock via biometric authentication.');
      return;
    }

    this._masterPassword = masterPassword;
    this._onUnlockSubject.next();
  }
}
