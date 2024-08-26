import { Injectable } from '@angular/core';
import {Subject, take} from "rxjs";
import moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class AppdataConflictBridgeService {

  private _notifyConflictSubject = new Subject<Conflict>();
  public notifyConflict$ = this._notifyConflictSubject.asObservable();

  private _notifyConflictResponseSubject = new Subject<ConflictResolution>();
  public notifyConflictResponse$ = this._notifyConflictResponseSubject.asObservable();

  private _conflictInProgress: boolean = false;
  public get conflictInProgress(): boolean {
    return this._conflictInProgress;
  }


  public async respond(resolution: ConflictResolution) {
    if(!this.conflictInProgress)
      throw new Error('No conflict in progress to respond to');

    this._notifyConflictResponseSubject.next(resolution);
  }

  public async requestConflictResolution(conflict: Conflict): Promise<ConflictResolution> {
    this._conflictInProgress = true;
    const responsePromise = new Promise<ConflictResolution>((resolve) => {
      this.notifyConflictResponse$.pipe(take(1)).subscribe(response => {
        this._conflictInProgress = false;
        resolve(response);
      });
    });

    this._notifyConflictSubject.next(conflict);
    return await responsePromise;
  }
}

export type Conflict = {
  type: 'last-modified-mismatch',
  localMoment: moment.Moment;
  cloudMoment: moment.Moment;
} | {
  type: 'origin-mismatch'
}

export type ConflictType = 'origin-mismatch' | 'last-modified-mismatch';
export type ConflictResolution = 'take-cloud' | 'keep-local' | 'disable-sync';
