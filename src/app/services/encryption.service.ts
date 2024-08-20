import {Injectable} from '@angular/core';
import {sha256} from "../helpers/hash-utils";

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private _masterPassword: string | null = null;

  public async setMasterPassword(input: string): Promise<void> {
    if (!input.trim())
      throw new Error('Master password cannot be empty!');

    this._masterPassword = await sha256(`swift-budget:${input}`);
  }

  public async checkMasterPassword(): Promise<void> {

  }


}

type EncryptedPayload = {
  salt: string;
  iv: string;
  cipher: string;
};

export class EncryptionHandler {
  async encryptString(input: string, password: string): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await this.createKey(password,  salt);

    const inputBytes = this.convertStringToBytes(input);
    const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key,  inputBytes)
    const cipher = new Uint8Array(encryptedBuffer);

    const encryptedPayload: EncryptedPayload = {
      iv: this.convertBytesToBase64(iv),
      salt: this.convertBytesToBase64(salt),
      cipher: this.convertBytesToBase64(cipher)
    }
    const payloadJson = JSON.stringify(encryptedPayload);
    return btoa(payloadJson); // Return base64
  }

  async decryptString(input: string, password: string): Promise<string> {
    const encryptedPayloadJson = atob(input); // Decode base64 first
    const encryptedPayload = JSON.parse(encryptedPayloadJson) as EncryptedPayload;
    if (!encryptedPayload.iv || !encryptedPayload.salt || !encryptedPayload.cipher)
      throw new Error('Cannot decrypt malformed payload');

    const iv = this.convertBase64ToBytes(encryptedPayload.iv);
    const salt = this.convertBase64ToBytes(encryptedPayload.salt);
    const cipher = this.convertBase64ToBytes(encryptedPayload.cipher);

    const key = await this.createKey(password, salt);

    const decryptedContentBuffer = await crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, cipher);
    const decryptedBytes = new Uint8Array(decryptedContentBuffer);

    return this.convertBytesToString(decryptedBytes);
  }

  private async createKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordBytes = this.convertStringToBytes(password);
    const initialKey = await crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']);

    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      initialKey,
      { name: 'AES-GCM',  length: 256 },
      false,
      ['encrypt', 'decrypt']);
  }

  private convertStringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  private convertBytesToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  }

  private convertBytesToBase64(bytes: Uint8Array): string {
    return btoa(Array.from(bytes,  b => String.fromCharCode(b)).join(''));
  }

  private convertBase64ToBytes(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  }
}
