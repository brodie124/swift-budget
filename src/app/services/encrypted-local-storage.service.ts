import {Injectable, inject} from "@angular/core";
import {EncryptionService} from "./encryption.service";
import {LocalStorageService} from "./local-storage.service";
import {PasswordService} from "./password.service";

@Injectable({
  providedIn: 'root'
})
export class EncryptedLocalStorageService {
  private readonly _encryptionService = inject(EncryptionService);
  private readonly _passwordService = inject(PasswordService);
  private readonly _localStorageService = inject(LocalStorageService);

  public async getItemAsync(key: string): Promise<string | null> {
    const json = this._localStorageService.getItem(key);
    if (!json)
      return null;

    try {
      const payload = JSON.parse(json);
      if (!payload.e)
        return payload.v; // Not encrypted

      const password = await this._passwordService.waitForUnlock();
      return await this._encryptionService.decrypt<string>(password, payload.v);

    } catch (err) {
      console.error("Couldn't parse JSON object", err);
      return null;
    }
  }

  public async setItemAsync(key: string, value: string): Promise<void> {
    const isEncrypted = this._encryptionService.isEnabled();
    let password = '';
    if(isEncrypted)
      password = await this._passwordService.waitForUnlock();

    const storedValue = isEncrypted
      ? await this._encryptionService.encrypt(password, value)
      : value;

    const payload: Payload = {
      e: isEncrypted,
      v: storedValue
    }
    const payloadJson = JSON.stringify(payload);
    this._localStorageService.setItem(key, payloadJson);
  }
}

export type Payload = {
  e: boolean;
  v: string;
}
