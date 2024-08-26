import {inject, Injectable} from '@angular/core';
import {sha256} from "../helpers/hash-utils";
import {environment} from "../../environments/environment";
import {LocalStorageService} from "./local-storage.service";
import {Subject} from "rxjs";
import {PasswordService} from "./password.service";

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly _localStorageService = inject(LocalStorageService);
  private readonly _passwordService = inject(PasswordService);
  private readonly _encryptionHandler = new EncryptionHandler();

  public async checkPassword(password: string): Promise<boolean> {
    const encryptedCheckValue = this._localStorageService.getItem(environment.cacheKeys.encryptionCheck);
    if (!encryptedCheckValue)
      return false;

    return await this.verifyCheck(password, encryptedCheckValue);
  }

  public async writeCheck(): Promise<void> {
    const encryptedCheck = await this.getCheckAsync();
    if(!encryptedCheck)
      return;

    this._localStorageService.setItem(environment.cacheKeys.encryptionCheck, encryptedCheck);
  }

  public async getCheckAsync(): Promise<string | null> {
    if(!this._passwordService.masterPassword)
      return null;

    return btoa(await this.encrypt(this._passwordService.masterPassword, this._passwordService.masterPassword));
  }

  public async verifyCheck(password: string, check: string): Promise<boolean> {
    try {
      const val = atob(check);
      const result = await this.decrypt(password, val);
      return !!result && result === password;
    } catch(err) {
      console.error('Failed to verify check', err);
      return false;
    }
  }

  public isEnabled(): boolean {
    return this.isSupported() && this.isRequested();
  }

  public isRequested(): boolean {
    return !!this._localStorageService.getItem(environment.cacheKeys.encryptionCheck);
  }

  public encrypt(password: string, value: any): Promise<string> {
    return this._encryptionHandler.encryptObject(password, value);
  }

  public decrypt<T>(password: string, value: any): Promise<T | null> {
    return this._encryptionHandler.decryptObject<T>(password, value);
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


@Injectable({
  providedIn: 'root'
})
export class EncryptionHandler {
  // private readonly _passwordService = inject(PasswordService);

  public isSupported(): boolean {
    return !!window.crypto.subtle; // If subtle is defined then it should be enabled
  }

  public encryptObject(password: string, input: any): Promise<string> {
    if (input === null || input === undefined)
      throw new Error('Cannot encrypt null/undefined');

    const json = JSON.stringify(input);
    return this.encryptString(password, json);
  }

  public async decryptObject<T>(password: string, input: string): Promise<T | null> {
    try {
      const json = await this.decryptString(password, input);
      if (json === null)
        return null;

      return JSON.parse(json) as T;
    } catch (err) {
      console.error('Failed to parse decrypted JSON object', err);
      return null;
    }
  }

  public async encryptString(password: string, input: string): Promise<string> {
    if (!this.isSupported())
      throw new Error('Cannot encrypt - crypto.subtle not supported');

    if (!password)
      throw new Error('Cannot encrypt - no password provided');

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

  public async decryptString(password: string, input: string): Promise<string | null> {
    if (!this.isSupported()) {
      console.error('Cannot decrypt value - crypto.subtle not supported');
      return null;
    }

    if (!password) {
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
