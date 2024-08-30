import {inject, Injectable} from '@angular/core';
import {FinancialEvent, FinancialEventHistory, FinancialEventOccurrence} from "../../types/financial/financial-event";
import moment from "moment/moment";
import {TriggerEngine} from "../trigger-engine/trigger-engine.service";
import {FinancialEventHistoryManager} from "./financial-event-history-manager.service";
import {getMomentUtc, getMomentWithTime} from "../../utils/moment-utils";

@Injectable({
  providedIn: 'root'
})
export class FinancialEventService {
  private readonly _eventEngine: TriggerEngine = inject(TriggerEngine);
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

      if (occurrences.length <= 0) {
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
    const lastMarkedPaidMoment = history.lastMarkedPaid ? getMomentWithTime(history.lastMarkedPaid) : undefined;
    return lastMarkedPaidMoment?.isSameOrAfter(dateAsOf) ?? false;
  }
}
