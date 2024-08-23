import {Injectable} from '@angular/core';
import {FinancialEventOccurrence} from "../types/financial/financial-event";
import {getMomentUtc} from "../utils/moment-utils";

@Injectable({
  providedIn: 'root'
})
export class EventStatisticsService {

  public calculateStatistics(occurrences: ReadonlyArray<FinancialEventOccurrence>): EventStatistics {
    const dueRelativeToDate = getMomentUtc(); // Compare due dates to today

    let totalBills = 0;
    let billsPaid = 0;
    let billsUpcoming = 0;
    let billsOverdue = 0;
    let remainingExpense = 0;
    let totalExpense = 0;

    for (const occurrence of occurrences) {
      totalBills++;
      totalExpense += occurrence.event.expense;

      const isOverdue = !occurrence.isPaid && occurrence.date.isBefore(dueRelativeToDate);
      if (occurrence.isPaid) {
        billsPaid++;
      } else if (isOverdue) {
        billsOverdue++;
        remainingExpense += occurrence.event.expense;
      } else {
        billsUpcoming++;
        remainingExpense += occurrence.event.expense;
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
