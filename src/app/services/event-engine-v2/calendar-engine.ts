import {Guid} from "../../types/common-types";
import {RecurrenceEngine} from "./recurrence-engine";
import {EventExceptionManager} from "./event-exception-manager";
import {RecurringEventDefinition} from "./types/recurring-event-definition";
import {EventException} from "./types/event-exception";
import {EventOccurrence} from "./types/event-occurrence";
import {DateUtils} from "./utils/date-utils";
import { Injectable } from "@angular/core";
import { ReplaySubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CalendarEngine {
  private readonly _events: Map<Guid, RecurringEventDefinition> = new Map();
  private readonly _recurrenceEngine = new RecurrenceEngine();
  private readonly _exceptionManager = new EventExceptionManager();

  public addEvent(event: RecurringEventDefinition, importExceptions: boolean = true): void {
    this._events.set(event.id, event);
    if(!importExceptions)
      return;

    for(const exception of event.exceptions) {
      this._exceptionManager.addException(exception);
    }
  }

  public addException(exception: EventException): void {
    this._exceptionManager.addException(exception);
  }

  public getEventsInRange(
    startDate: Date,
    endDate: Date
  ): EventOccurrence[] {
    const allOccurrences: EventOccurrence[] = [];

    for (const [eventId] of this._events) {
      const occurrences = this.generateOccurrences(eventId, startDate, endDate);
      allOccurrences.push(...occurrences);
    }

    // Sort by date
    allOccurrences.sort((a, b) =>
      DateUtils.fromISODate(a.date).getTime() - DateUtils.fromISODate(b.date).getTime()
    );

    return allOccurrences;
  }

  public reset() {
    this.resetEvents();
    this.resetExceptions();
  }

  private generateOccurrences(
    eventId: Guid,
    startRange: Date,
    endRange: Date
  ): Array<EventOccurrence> {
    const event = this._events.get(eventId);
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }

    // Generate base occurrences
    const dates = this._recurrenceEngine.compute(
      event.recurrence,
      startRange,
      endRange
    );

    // Convert to Occurrence objects
    let occurrences: EventOccurrence[] = dates.map(date => ({
      recurringEventId: event.id,
      recurringEvent: event,
      date: DateUtils.toISODate(date),
      amount: event.amount,
      status: 'pending',
    }));

    // Apply exceptions
    occurrences = this._exceptionManager.applyExceptions(occurrences, eventId);

    return occurrences;
  }


  private resetEvents() {
    this._events.clear();
  }

  private resetExceptions() {
    this._exceptionManager.reset();
  }
}
