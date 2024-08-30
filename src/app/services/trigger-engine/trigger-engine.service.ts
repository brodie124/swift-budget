import {inject, Injectable} from "@angular/core";
import moment from "moment";
import {Trigger} from "../../types/event/trigger";
import {TriggerFrequency} from "../../types/event/trigger-frequency";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {MonthlyTriggerHandler} from "./trigger-handlers/monthly-trigger-handler";

export type TriggerEngineOptions = {
  trigger: Trigger;
  startDate: moment.Moment;
  endDate: moment.Moment
}

@Injectable({
  providedIn: 'root'
})
export class TriggerEngine {

  private readonly _monthlyTriggerHandler: MonthlyTriggerHandler = inject(MonthlyTriggerHandler);

  public getOccurrences(options: TriggerEngineOptions): Array<moment.Moment> {
    const occurrences: Array<moment.Moment> = this.calculate(options);
    return occurrences.sort(compareMomentsAscending);
  }

  private calculate(options: TriggerEngineOptions): Array<moment.Moment> {
    switch(options.trigger.frequency) {
      case TriggerFrequency.Monthly:
        return this._monthlyTriggerHandler.calculateOccurrences(options.trigger, options.startDate, options.endDate);

      default:
        console.warn(`Unhandled trigger frequency: ${options.trigger.frequency}`);
        return [];
    }
  }
}
