import {Injectable} from '@angular/core';
import {sha256} from "../helpers/hash-utils";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly _encryptionHandler = new EncryptionHandler();
  private _masterPassword: string | null = null;

  public async setMasterPassword(input: string): Promise<void> {
    if (!input.trim())
      throw new Error('Master password cannot be empty!');

    this._masterPassword = await sha256(`swift-budget:${input}`);
    this._encryptionHandler.password = this._masterPassword;
  }

  public async checkMasterPassword(): Promise<boolean> {
    const encryptedCheckValue = localStorage.getItem(environment.cacheKeys.encryptionCheck);
    if (!encryptedCheckValue)
      return false;

    const decryptedCheckValue = await this.decrypt<string>(atob(encryptedCheckValue));
    return decryptedCheckValue === this._masterPassword;
  }

  public async writeCheck(): Promise<void> {
    const encryptedCheck = btoa(await this.encrypt(this._masterPassword));
    localStorage.setItem(environment.cacheKeys.encryptionCheck, encryptedCheck);
  }

  public encrypt(value: any): Promise<string> {
    return this._encryptionHandler.encryptObject(value);
  }

  public decrypt<T>(value: any): Promise<T | null> {
    return this._encryptionHandler.decryptObject<T>(value);
  }

  public isSupported(): boolean {
    return this._encryptionHandler.isSupported();
  }
}

type EncryptedPayload = {
  salt: string;
  iv: string;
  cipher: string;
};

export class EncryptionHandler {
  private _password: string | null = null;

  public set password(input: string | null | undefined) {
    this._password = input ?? null;
  }

  public isSupported(): boolean {
    return !!window.crypto.subtle; // If subtle is defined then it should be enabled
  }

  public encryptObject(input: any): Promise<string> {
    if (input === null || input === undefined)
      throw new Error('Cannot encrypt null/undefined');

    const json = JSON.stringify(input);
    return this.encryptString(json);
  }

  public async decryptObject<T>(input: string): Promise<T | null> {
    try {
      const json = await this.decryptString(input);
      if (json === null)
        return null;

      return JSON.parse(json) as T;
    } catch (err) {
      console.error('Failed to parse decrypted JSON object', err);
      return null;
    }
  }

  public async encryptString(input: string): Promise<string> {
    if (!this.isSupported())
      throw new Error('Cannot encrypt - crypto.subtle not supported');

    if (!this._password)
      throw new Error('Cannot encrypt - no password provided');

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await this.createKey(this._password,  salt);

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

  public async decryptString(input: string): Promise<string | null> {
    if (!this.isSupported()) {
      console.error('Cannot decrypt value - crypto.subtle not supported');
      return null;
    }

    if (!this._password) {
      console.warn('Cannot decrypt value - no password provided');
      return null;
    }

    const encryptedPayloadJson = atob(input); // Decode base64 first
    const encryptedPayload = JSON.parse(encryptedPayloadJson) as EncryptedPayload;
    if (!encryptedPayload.iv || !encryptedPayload.salt || !encryptedPayload.cipher)
      return null;

    const iv = this.convertBase64ToBytes(encryptedPayload.iv);
    const salt = this.convertBase64ToBytes(encryptedPayload.salt);
    const cipher = this.convertBase64ToBytes(encryptedPayload.cipher);

    const key = await this.createKey(this._password, salt);

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
