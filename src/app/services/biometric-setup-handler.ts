import {inject, Injectable} from "@angular/core";
import {BiometricAuthService} from "./biometric-auth.service";
import {PasswordService} from "./password.service";

@Injectable({ providedIn: "root" })
export class BiometricSetupHandler {
  private readonly _biometricAuthService = inject(BiometricAuthService);
  private readonly _passwordService = inject(PasswordService);

  public isBiometricAuthSupported(): boolean {
    return this._biometricAuthService.isSupported();
  }

  public async isBiometricAuthRegistered(): Promise<boolean> {
    return await this._biometricAuthService.isRegistered();
  }

  public async registerBiometricAuth(): Promise<void> {
    if (await this.isBiometricAuthRegistered()) {
      console.warn('Cannot setup biometric authentication when it is already enabled.');
      return;
    }

    const masterPassword = await this._passwordService.waitForUnlock();
    const registerResult = await this._biometricAuthService.register('SwiftBudget');
    if (!registerResult) {
      throw new Error('Failed to register biometric authentication.');
    }

    await this._biometricAuthService.saveData('mu', masterPassword);
  }

  public async clearBiometricAuth(): Promise<boolean> {
    const isRegistered = await this.isBiometricAuthRegistered();
    if (!isRegistered) {
      console.warn('Cannot clear biometric authentication when it is not registered.');
      return false;
    }

    this._biometricAuthService.clearRegistration();
    return true;
  }
}
