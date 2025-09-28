import { DateTimeIsoString, Guid } from "../../types/common-types";
import { EventException } from "./types/event-exception";
import { EventOccurrence } from "./types/event-occurrence";

export class EventExceptionManager {
  private readonly _exceptions: Map<Guid, EventException[]> = new Map();

  public addException(exception: EventException): void {
    const eventExceptions = this._exceptions.get(exception.recurringEventId) || [];
    eventExceptions.push(exception);
    this._exceptions.set(exception.recurringEventId, eventExceptions);
  }

  public applyExceptions(
    occurrences: Array<EventOccurrence>,
    eventId: Guid
  ): Array<EventOccurrence> {
    const eventExceptions = this._exceptions.get(eventId) || [];

    // Build exception map for O(1) lookups
    const exceptionMap = new Map<DateTimeIsoString, EventException>();
    for (const exception of eventExceptions) {
      exceptionMap.set(exception.originalDate, exception);
    }

    const results: Array<EventOccurrence> = [];
    for (const occurrence of occurrences) {
      const exception = exceptionMap.get(occurrence.date);
      if (!exception) {
        results.push(occurrence);
        continue;
      }

      switch (exception.type) {
        case 'cancelled':
          // Skip this occurrence
          break;

        case 'modified':
          results.push({
            ...occurrence,
            ...exception.occurrenceChanges,
            isException: true,
            recurringEvent: {
              ...occurrence.recurringEvent,
              ...exception.definitionChanges
            },
          });
          break;

        case 'rescheduled':
          results.push({
            ...occurrence,
            date: exception.newDate,
            isException: true,
          });
          break;
      }
    }

    return results;
  }

  public getExceptionsForEvent(eventId: Guid): EventException[] {
    return this._exceptions.get(eventId) || [];
  }

  reset() {
    this._exceptions.clear();
  }
}
