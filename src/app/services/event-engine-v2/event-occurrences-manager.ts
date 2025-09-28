import { inject, Inject } from "@angular/core";
import { CalendarEngine } from "./calendar-engine";
import { RecurringEventDefinitionProvider } from "./recurring-event-definition-provider.service";
import { EventOccurrence } from "./types/event-occurrence";
import { distinctUntilChanged, ReplaySubject } from "rxjs";

@Inject({ providedIn: 'root' })
export class EventOccurrencesManager {
  private readonly _calendarEngine = inject(CalendarEngine);
  private readonly _eventDefinitionProvider = inject(RecurringEventDefinitionProvider);

  private readonly _eventOccurrencesSubject = new ReplaySubject<Array<EventOccurrence>>(1);
  public readonly eventOccurrences$ = this._eventOccurrencesSubject.asObservable();

  private _startDate: Date = new Date();
  private _endDate: Date = new Date();

  constructor() {
    this.setupSubscriptions(); // TODO: Move this into an APP_INITIALIZER.
  }

  public setDateRange(startDate: Date | string, endDate: Date | string) {
    this._startDate = startDate instanceof Date ? startDate : new Date(startDate);
    this._endDate = endDate instanceof Date ? endDate : new Date(endDate);
    this.updateEventOccurrences();
  }

  public setupSubscriptions() {
    this._eventDefinitionProvider.events$
      // .pipe(distinctUntilChanged())
      .subscribe(events => {
        console.log("Received new event definitions", events);
        this._calendarEngine.reset();
        for(const event of events) {
          this._calendarEngine.addEvent(event);
        }

        this.updateEventOccurrences();
      });
  }

  private updateEventOccurrences() {
    const occurrences = this._calendarEngine.getEventsInRange(this._startDate, this._endDate);
    this._eventOccurrencesSubject.next(occurrences);
  }
}
