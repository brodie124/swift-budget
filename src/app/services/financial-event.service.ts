import {inject, Injectable} from '@angular/core';
import {FinancialEvent} from "../types/financial/financial-event";
import moment from "moment/moment";
import {EventEngineService} from "./event-engine/event-engine.service";

export type CalculatedFinancialEvent = {
  event: FinancialEvent,
  occurrences: Array<moment.Moment>;
  isPaid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FinancialEventService {
  private readonly _eventEngine: EventEngineService = inject(EventEngineService);

  public getCalculatedEvents(
    events: ReadonlyArray<FinancialEvent>,
    startDate: moment.Moment,
    endDate: moment.Moment
  ): Array<CalculatedFinancialEvent> {
    const calculatedEvents: Array<CalculatedFinancialEvent> = [];
    for (let event of events) {
      const occurrences = this._eventEngine.getOccurrences({
        trigger: event.trigger,
        startDate: startDate,
        endDate: endDate
      });

      if(occurrences.length <= 0) {
        console.info("Event found with no occurrences.");
        continue;
      }

      calculatedEvents.push({
        event: event,
        occurrences: occurrences,
        isPaid: false,
      });
    }

    return calculatedEvents;
  }
}
