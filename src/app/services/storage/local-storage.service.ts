import {Injectable} from '@angular/core';
import {filter, Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements Storage {
  private _listeners: Map<string, () => {}> = new Map();

  private readonly _getSubject: Subject<{ key: string }> = new Subject();
  private readonly _setSubject: Subject<{ key: string, value: string | null }> = new Subject();
  private readonly _removeSubject: Subject<{ key: string }> = new Subject();

  public readonly get$: Observable<{ key: string }> = this._getSubject.asObservable();
  public readonly set$: Observable<{ key: string, value: string | null }> = this._setSubject.asObservable();
  public readonly remove$: Observable<{ key: string }> = this._removeSubject.asObservable();

  public get length(): number {
    return localStorage.length;
  }

  clear(): void {
    return localStorage.clear();
  }

  getItem(key: string): string | null {
    const value = localStorage.getItem(key);
    this._getSubject.next({ key });
    return value;
  }

  key(index: number): string | null {
    return localStorage.key(index);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
    this._removeSubject.next({key});
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
    this._setSubject.next({key, value});
  }

  getKeys(): Array<string> {
    return Object.keys(localStorage);
  }
}

