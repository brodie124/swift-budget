import {Injectable, inject} from "@angular/core";
import {EncryptionService} from "./encryption.service";

@Injectable({
  providedIn: 'root'
})
export class EncryptedLocalStorageService {
  private readonly _encryptionService = inject(EncryptionService);

  public async getItemAsync(key: string): Promise<string | null> {
    const json = localStorage.getItem(key);
    if (!json)
      return null;

    try {
      const payload = JSON.parse(json);
      if (!payload.e)
        return payload.v; // Not encrypted

      return await this._encryptionService.decrypt<string>(payload.v);

    } catch (err) {
      console.error("Couldn't parse JSON object", err);
      return null;
    }
  }

  public async setItemAsync(key: string, value: string): Promise<void> {
    const isEncrypted = this._encryptionService.isEnabled();
    const storedValue = isEncrypted
      ? await this._encryptionService.encrypt(value)
      : value;

    const payload: Payload = {
      e: isEncrypted,
      v: storedValue
    }
    const payloadJson = JSON.stringify(payload);
    localStorage.setItem(key, payloadJson);
  }
}

export type Payload = {
  e: boolean;
  v: string;
}
