import {Injectable} from '@angular/core';
import {LocalStorageService} from "./storage/local-storage.service";
import {CommonTypeGuards, StrictTypeGuardBuilder} from "@bpits/type-guards";
import {environment} from "../../environments/environment";

type EncryptedObject = {
  data: string;
  iv: string;
  timestamp: number;
};

const isEncryptedObject = StrictTypeGuardBuilder
  .start<EncryptedObject>('EncryptedObject')
  .validateProperty('data', CommonTypeGuards.basics.string())
  .validateProperty('iv', CommonTypeGuards.basics.string())
  .validateProperty('timestamp', CommonTypeGuards.basics.number())
  .build();

/** TODO: Refactor this class to have methods along the following:
 * * isRegistered()
 * * registerAppDataKey()
 * * getAppDataKey()
 */
@Injectable({
  providedIn: 'root'
})
export class BiometricAuthService {
  constructor(private _storage: LocalStorageService) {}

  /**
   * Check if WebAuthn is supported
   */
  isSupported(): boolean {
    return window.PublicKeyCredential !== undefined
      && navigator.credentials !== undefined;
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<boolean> {
    if (!this.isSupported())
      return false;

    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Check if user has already registered
   */
  public async isRegistered(): Promise<boolean> {
    const credentialId = this._storage.getItem(environment.cacheKeys.bio.credential);
    return !!credentialId;
  }

  /**
   * Register biometric credential (offline-first)
   */
  public async register(userId: string): Promise<boolean> {
    if (!await this.isBiometricAvailable()) {
      throw new Error('Biometric authentication not available on this device');
    }

    try {
      // Generate random challenge locally
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      // Generate random user ID for privacy
      const userIdBuffer = crypto.getRandomValues(new Uint8Array(32));

      const credentialOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: challenge,
          rp: {
            name: 'Offline PWA',
            id: window.location.hostname
          },
          user: {
            id: userIdBuffer,
            name: userId,
            displayName: userId
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' }  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: true,  // Store credential on device
            residentKey: 'required'
          },
          timeout: 60000,
          attestation: 'none'
        }
      };

      const credential = await navigator.credentials.create(credentialOptions) as PublicKeyCredential;
      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Store credential ID and salt
      const credentialId = this.bufferToBase64(credential.rawId);
      await this._storage.setItem(environment.cacheKeys.bio.credential, credentialId);

      // Generate and store encryption salt
      const salt = crypto.getRandomValues(new Uint8Array(16));
      await this._storage.setItem(environment.cacheKeys.bio.salt, this.bufferToBase64(salt));

      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save encrypted data (with specific key)
   */
  public async saveData(key: string, data: string): Promise<void> {
    const encryptionKey = await this.authenticate();

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      encryptionKey,
      dataBuffer
    );

    const encryptedObject: EncryptedObject = {
      data: this.bufferToBase64(encryptedData),
      iv: this.bufferToBase64(iv),
      timestamp: Date.now()
    };

    const encryptedObjectJson = JSON.stringify(encryptedObject);
    this._storage.setItem(`${environment.cacheKeys.bio.userDataStore}_${key}`, encryptedObjectJson);
  }

  /**
   * Load encrypted data (with specific key)
   */
  public async loadData(key: string): Promise<string | null> {
    const encryptedObjectJson = this._storage.getItem(`${environment.cacheKeys.bio.userDataStore}_${key}`);
    if (!encryptedObjectJson) {
      return null;
    }

    const encryptedObject = JSON.parse(encryptedObjectJson);
    if (!isEncryptedObject(encryptedObject)) {
      console.error('Encrypted object malformed:', encryptedObject);
      return null;
    }

    const encryptionKey = await this.authenticate();
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: this.base64ToBuffer(encryptedObject.iv)
      },
      encryptionKey,
      this.base64ToBuffer(encryptedObject.data)
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  public clearRegistration(): void {
    this._storage.removeItem(environment.cacheKeys.bio.credential);
    this._storage.removeItem(environment.cacheKeys.bio.salt);

    for (const key of this._storage.getKeys()) {
      if (key.startsWith(environment.cacheKeys.bio.userDataStore)) {
        this._storage.removeItem(environment.cacheKeys.bio.userDataStore);
      }
    }
  }

  /**
   * Authenticate and get encryption key
   */
  private async authenticate(): Promise<CryptoKey> {
    const credentialId = this._storage.getItem(environment.cacheKeys.bio.credential);
    if (!credentialId) {
      throw new Error('No credential found. Please register first.');
    }

    try {
      // Generate challenge locally
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const authOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: challenge,
          allowCredentials: [{
            id: this.base64ToBuffer(credentialId),
            type: 'public-key',
            transports: ['internal']
          }],
          userVerification: 'required',
          timeout: 60000
        }
      };

      const assertion = await navigator.credentials.get(authOptions);
      if (!assertion) {
        throw new Error('Authentication failed');
      }

      // Derive encryption key
      return await this.deriveEncryptionKey(credentialId);
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Biometric authentication failed. Please try again.');
    }
  }

  private async deriveEncryptionKey(credentialId: string): Promise<CryptoKey> {
    const salt = await this._storage.getItem(environment.cacheKeys.bio.salt);

    if (!salt) {
      throw new Error('Encryption salt not found');
    }

    const baseKey = await crypto.subtle.importKey(
      'raw',
      this.base64ToBuffer(credentialId),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.base64ToBuffer(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
