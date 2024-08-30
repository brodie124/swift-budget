import {Injectable} from "@angular/core";
import {TriggerAdvancedOptions, TriggerMonthly, InvalidDayFallback} from "../../../types/event/trigger";
import moment from "moment/moment";
import {TriggerHandler} from "./event-trigger-handle";
import {getMomentUtc} from "../../../utils/moment-utils";

export type TriggerMonthlyAdvanced = TriggerMonthly & TriggerAdvancedOptions;

@Injectable({ providedIn: 'root'})
export class MonthlyTriggerHandler implements TriggerHandler<TriggerMonthlyAdvanced> {

  public calculateOccurrences(
    trigger: TriggerMonthlyAdvanced,
    startDate: moment.Moment,
    endDate: moment.Moment
  ): Array<moment.Moment> {
    const occurrences: Array<moment.Moment> = [];

    const deltaMonths = Math.max(1, endDate.diff(startDate, 'months'));
    for (let i = 0; i <= deltaMonths; i++) {
      switch (trigger.options.type) {
        case 'specific-date':
          let evaluationDate = getMomentUtc(startDate)
            .add(i, 'months');


          if(trigger.options.dayOfMonth <= evaluationDate.daysInMonth()) {
            // Use the date as specified
            evaluationDate = evaluationDate.set('date', trigger.options.dayOfMonth);
          } else {
            if(trigger.advancedOptions.invalidDayFallback === InvalidDayFallback.NextAllowedDay) {
              // Go to the first day of the following month
              evaluationDate = evaluationDate.add(1, 'month').set('date', 1);
            } else {
              // Go to the last available day of the same month
              evaluationDate = evaluationDate.set('date', evaluationDate.daysInMonth());
            }
          }

          if (evaluationDate.isSameOrAfter(startDate) && evaluationDate.isSameOrBefore(endDate))
            occurrences.push(evaluationDate);
      }
    }

    return occurrences;
  }

}
