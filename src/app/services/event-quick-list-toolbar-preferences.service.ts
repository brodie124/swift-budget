import {inject, Injectable} from "@angular/core";
import moment from "moment";
import {environment} from "../../environments/environment";
import {getMomentUtc} from "../utils/moment-utils";
import {LocalStorageService} from "./local-storage.service";

@Injectable({providedIn: 'root'})
export class EventQuickListToolbarPreferencesService {
  private readonly _localStorageService = inject(LocalStorageService);

  private _date: Date | moment.Moment | null = null;

  public set payday(date: Date | moment.Moment | null | undefined) {
    this._date = date ?? null;
    const value = this._date
      ? JSON.stringify(this._date)
      : '';

    this._localStorageService.setItem(environment.cacheKeys.paydayPreference, value);
  }

  public get payday(): moment.Moment | null {
    if (this._date)
      return getMomentUtc(this._date);

    const json = this._localStorageService.getItem(environment.cacheKeys.paydayPreference);
    if (!json)
      return null;

    const date = JSON.parse(json);
    if (!date)
      return null;

    this._date = getMomentUtc(date);
    return this._date;
  }
}
