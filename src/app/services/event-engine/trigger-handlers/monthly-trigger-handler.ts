import {Injectable} from "@angular/core";
import {EventTriggerAdvancedOptions, EventTriggerMonthly, InvalidDayFallback} from "../../../types/event/event";
import moment from "moment/moment";
import {EventTriggerHandler} from "./event-trigger-handle";

export type EventTriggerMonthlyAdvanced = EventTriggerMonthly & EventTriggerAdvancedOptions;

@Injectable({ providedIn: 'root'})
export class MonthlyTriggerHandler implements EventTriggerHandler<EventTriggerMonthlyAdvanced> {

  public calculateOccurrences(
    trigger: EventTriggerMonthlyAdvanced,
    startDate: moment.Moment,
    endDate: moment.Moment
  ): Array<moment.Moment> {
    const occurrences: Array<moment.Moment> = [];

    const deltaMonths = Math.max(1, endDate.diff(startDate, 'months'));
    for (let i = 0; i <= deltaMonths; i++) {
      switch (trigger.options.type) {
        case 'specific-date':
          let evaluationDate = moment(startDate)
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
