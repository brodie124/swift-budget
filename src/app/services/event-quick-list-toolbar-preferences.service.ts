import {Injectable} from "@angular/core";
import moment from "moment";

@Injectable({providedIn: 'root'})
export class EventQuickListToolbarPreferencesService {

  private readonly _cacheKey: string = 'sb-event-quick-list-preferences';

  private _date: Date | moment.Moment | null = null;

  public set payday(date: Date | moment.Moment | null | undefined) {
    this._date = date ?? null;
    const value = this._date
      ? JSON.stringify(this._date)
      : '';

    localStorage.setItem(`${this._cacheKey}_payday`, value);
  }

  public get payday(): moment.Moment | null {
    if (this._date)
      return moment(this._date);

    const json = localStorage.getItem(`${this._cacheKey}_payday`);
    if (!json)
      return null;

    const date = JSON.parse(json);
    if (!date)
      return null;

    this._date = moment(date);
    return this._date;
  }
}
