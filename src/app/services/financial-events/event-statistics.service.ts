import {Injectable} from '@angular/core';
import {getMomentUtc} from "../../utils/moment-utils";
import {EventOccurrence} from "../event-engine-v2/types/event-occurrence";

@Injectable({
  providedIn: 'root'
})
export class EventStatisticsService {

  public calculateStatistics(occurrences: ReadonlyArray<EventOccurrence>): EventStatistics {
    const dueRelativeToDate = getMomentUtc(); // Compare due dates to today

    let totalBills = 0;
    let billsPaid = 0;
    let billsUpcoming = 0;
    let billsOverdue = 0;
    let remainingExpense = 0;
    let totalExpense = 0;

    for (const occurrence of occurrences) {
      totalBills++;
      totalExpense += occurrence.amount;

      const isOverdue = occurrence.status !== 'paid' && dueRelativeToDate.isAfter(occurrence.date);
      if (occurrence.status === 'paid') {
        billsPaid++;
      } else if (isOverdue) {
        billsOverdue++;
        remainingExpense += occurrence.amount;
      } else {
        billsUpcoming++;
        remainingExpense += occurrence.amount;
      }
    }

    return {
      totalBills,
      totalExpense,

      billsUpcoming,
      remainingExpense,

      billsPaid,
      billsOverdue,
    }
  }

}

export type EventStatistics = {
  totalBills: number;
  billsPaid: number;
  billsUpcoming: number;
  billsOverdue: number;
  remainingExpense: number;
  totalExpense: number;
}
