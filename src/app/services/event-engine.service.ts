import {Injectable} from "@angular/core";
import {RecurringEvent, RecurringEventMonthly} from "../types/event/event";
import {EventFrequency} from "../types/event/event-frequency";
import moment from "moment";
import {compareMomentsAscending} from "../helpers/moment-utils";

@Injectable({
  providedIn: 'root'
})
export class EventEngineService {

  public calculateOccurrences(event: RecurringEvent, startDate: moment.Moment, endDate: moment.Moment): Array<moment.Moment> {
    let occurrences: Array<moment.Moment> = [];
    if(event.frequency === EventFrequency.Monthly) {
      // Handle the monthly frequency
      occurrences = this.calculateMonthlyOccurrences(event, startDate, endDate);
    }

    occurrences.sort((a, b) => compareMomentsAscending(a, b))
    return occurrences;
  }

  private calculateMonthlyOccurrences(event: RecurringEventMonthly, startDate: moment.Moment, endDate: moment.Moment): Array<moment.Moment> {
    const occurrences: Array<moment.Moment> = [];

    const deltaMonths = endDate.diff(startDate, 'months');
    for(let i = 0; i <= deltaMonths; i++) {
      switch(event.options.type) {
        case 'specific-date':
          const incrementedDate = moment(startDate).add(i, 'months');
          const year = incrementedDate.year();
          const month = incrementedDate.month() + 1; // .month() returns the index of the month
          const day = event.options.dayOfMonth;

          // TODO: we need to handle when `dayOfMonth` is greater than the number of days in the month (it should be pushed back to the next month)
          const dateString = `${year}-${month}-${day}`;
          const date = moment.utc(dateString)
          occurrences.push(date);
      }


    }


    return occurrences;
  }

}
