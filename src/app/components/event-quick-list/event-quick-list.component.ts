import {Component, computed, input, signal} from '@angular/core';
import {FinancialEvent, FinancialEventHistory, FinancialEventOccurrence} from "../../types/financial/financial-event";
import moment from "moment";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {getMomentUtc} from "../../utils/moment-utils";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-event-quick-list',
  templateUrl: './event-quick-list.component.html',
  styleUrls: ['./event-quick-list.component.less'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({opacity: 0, height: '0'}),
        animate('100ms ease-in', style({opacity: 1, height: '*'})), //100ms
      ]),
      transition(':leave', [
        style({opacity: 1, height: '*'}),
        animate('100ms ease-in', style({opacity: 0, height: '0'})), //100ms
      ])
    ])
  ]
})
export class EventQuickListComponent {
  public readonly occurrences = input.required<ReadonlyArray<FinancialEventOccurrence>>();
  public readonly startDate = input.required<moment.Moment>();
  public readonly endDate = input.required<moment.Moment>();

  public showCreateBill = signal<boolean>(false);
  public editBill = signal<FinancialEventOccurrence | undefined>(undefined);

  public items = computed(() => this.occurrences()
    .map(occurrence => this.createQuickListItem(occurrence))
    .sort((a, b) => compareMomentsAscending(a.nextOccurrence.date, b.nextOccurrence.date)));


  private createQuickListItem(calculatedEvent: FinancialEventOccurrence): EventQuickListItem {
    const comparisonDate = getMomentUtc();
    const timeUntilSeconds = calculatedEvent.date.diff(comparisonDate, 'seconds', false);
    const timeUntilDays = calculatedEvent.date.diff(comparisonDate, 'days', false);

    return {
      history: calculatedEvent.history,
      financialEvent: calculatedEvent.event,
      calculatedEvent: calculatedEvent,
      isOverdue: !calculatedEvent.isPaid && timeUntilSeconds < 0,
      nextOccurrence: {
        date: calculatedEvent.date,
        timeUntil: {
          seconds: timeUntilSeconds,
          days: timeUntilDays
        }
      }
    }
  }
}

export type EventQuickListItem = {
  financialEvent: FinancialEvent;
  calculatedEvent: FinancialEventOccurrence;
  history: FinancialEventHistory;
  isOverdue: boolean;
  nextOccurrence: {
    date: moment.Moment;
    timeUntil: {
      seconds: number;
      days: number;
    }
  },
}

