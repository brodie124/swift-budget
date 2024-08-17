import {Injectable} from "@angular/core";
import {EventTriggerMonthly} from "../../../types/event/event";
import moment from "moment/moment";
import {EventTriggerHandler} from "./event-trigger-handle";

@Injectable({ providedIn: 'root'})
export class MonthlyTriggerHandler implements EventTriggerHandler<EventTriggerMonthly> {

  public calculateOccurrences(
    trigger: EventTriggerMonthly,
    startDate: moment.Moment,
    endDate: moment.Moment
  ): Array<moment.Moment> {
    const occurrences: Array<moment.Moment> = [];

    const deltaMonths = Math.max(1, endDate.diff(startDate, 'months'));
    for (let i = 0; i <= deltaMonths; i++) {
      switch (trigger.options.type) {
        case 'specific-date':
          const incrementedDate = moment(startDate).add(i, 'months');
          const year = incrementedDate.year();
          const month = incrementedDate.month() + 1; // .month() returns the index of the month
          const day = trigger.options.dayOfMonth;

          // TODO: we need to handle when `dayOfMonth` is greater than the number of days in the month (it should be pushed back to the next month)
          const dateString = `${year}-${month}-${day}`;
          const date = moment.utc(dateString)
          if (date.isAfter(startDate) && date.isBefore(endDate))
            occurrences.push(date);
      }
    }

    return occurrences;
  }

}
