import {inject, Injectable} from '@angular/core';
import {FinancialEvent, FinancialEventHistory, FinancialEventOccurrence} from "../types/financial/financial-event";
import moment from "moment/moment";
import {EventEngineService} from "./event-engine/event-engine.service";
import {FinancialEventHistoryManager} from "./financial-event-history-manager.service";

@Injectable({
  providedIn: 'root'
})
export class FinancialEventService {
  private readonly _eventEngine: EventEngineService = inject(EventEngineService);
  private readonly _financialEventHistoryManager: FinancialEventHistoryManager = inject(FinancialEventHistoryManager);

  public async getCalculatedEventsAsync(
    events: ReadonlyArray<FinancialEvent>,
    startDate: moment.Moment,
    endDate: moment.Moment
  ): Promise<Array<FinancialEventOccurrence>> {
    const calculatedEvents: Array<FinancialEventOccurrence> = [];
    for (let event of events) {

      const eventHistory = await this._financialEventHistoryManager.getHistoryAsync(event.uid);
      const occurrences = this._eventEngine.getOccurrences({
        trigger: event.trigger,
        startDate: startDate,
        endDate: endDate
      });

      if(occurrences.length <= 0) {
        console.info("Event found with no occurrences.");
        continue;
      }

      const instances: Array<FinancialEventOccurrence> = occurrences.map(date => ({
        occurrenceId: `${event.uid}_${date.format('YYYY-MM-DD')}`,
        event: event,
        history: eventHistory,
        date: date,
        isPaid: this.isPaid(eventHistory, date),
      }));

      calculatedEvents.push(...instances);
    }

    return calculatedEvents;
  }

  private isPaid(history: FinancialEventHistory, dateAsOf: moment.Moment): boolean {
    return history.lastMarkedPaid?.isAfter(dateAsOf) ?? false;
  }
}
