import {inject, Injectable} from "@angular/core";
import moment from "moment";
import {EventTrigger} from "../../types/event/event";
import {EventFrequency} from "../../types/event/event-frequency";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {MonthlyTriggerHandler} from "./trigger-handlers/monthly-trigger-handler";

export type EventEngineOptions = {
  trigger: EventTrigger;
  startDate: moment.Moment;
  endDate: moment.Moment
}

@Injectable({
  providedIn: 'root'
})
export class EventEngineService {

  private readonly _monthlyTriggerHandler: MonthlyTriggerHandler = inject(MonthlyTriggerHandler);

  public getOccurrences(options: EventEngineOptions): Array<moment.Moment> {
    const occurrences: Array<moment.Moment> = this.calculate(options);
    return occurrences.sort(compareMomentsAscending);
  }

  private calculate(options: EventEngineOptions): Array<moment.Moment> {
    switch(options.trigger.frequency) {
      case EventFrequency.Monthly:
        return this._monthlyTriggerHandler.calculateOccurrences(options.trigger, options.startDate, options.endDate);

      default:
        console.warn(`Unhandled event trigger frequency: ${options.trigger.frequency}`);
        return [];
    }
  }
}
