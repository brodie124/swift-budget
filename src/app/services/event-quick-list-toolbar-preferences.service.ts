import {Injectable} from "@angular/core";
import moment from "moment";
import {environment} from "../../environments/environment";

@Injectable({providedIn: 'root'})
export class EventQuickListToolbarPreferencesService {
  private _date: Date | moment.Moment | null = null;

  public set payday(date: Date | moment.Moment | null | undefined) {
    this._date = date ?? null;
    const value = this._date
      ? JSON.stringify(this._date)
      : '';

    localStorage.setItem(environment.cacheKeys.paydayPreference, value);
  }

  public get payday(): moment.Moment | null {
    if (this._date)
      return moment(this._date);

    const json = localStorage.getItem(environment.cacheKeys.paydayPreference);
    if (!json)
      return null;

    const date = JSON.parse(json);
    if (!date)
      return null;

    this._date = moment(date);
    return this._date;
  }
}
