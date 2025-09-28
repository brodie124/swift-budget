import {Component, computed, input, signal} from '@angular/core';
import moment from "moment";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {getMomentUtc} from "../../utils/moment-utils";
import {animate, style, transition, trigger} from "@angular/animations";
import {EventOccurrence} from "../../services/event-engine-v2/types/event-occurrence";
import {RecurringEventDefinition} from "../../services/event-engine-v2/types/recurring-event-definition";

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
  public readonly occurrences = input.required<ReadonlyArray<EventOccurrence>>();
  public readonly startDate = input.required<moment.Moment>();
  public readonly endDate = input.required<moment.Moment>();

  public showCreateBill = signal<boolean>(false);
  public editBill = signal<EventOccurrence | undefined>(undefined);

  public items = computed(() => this.occurrences()
    .map(occurrence => this.createQuickListItem(occurrence))
    .sort((a, b) => compareMomentsAscending(a.nextOccurrenceDate.date, b.nextOccurrenceDate.date)));


  private createQuickListItem(calculatedEvent: EventOccurrence): EventQuickListItem {
    const comparisonDate = getMomentUtc();
    const eventDate = moment(calculatedEvent.date);
    const timeUntilSeconds = eventDate.diff(comparisonDate, 'seconds', false);
    const timeUntilDays = eventDate.diff(comparisonDate, 'days', false);

    return {
      // history: occurrence.history,
      definition: calculatedEvent.recurringEvent,
      occurrence: calculatedEvent,
      isOverdue: calculatedEvent.status !== 'paid' && timeUntilSeconds < 0,
      nextOccurrenceDate: {
        date: eventDate,
        timeUntil: {
          seconds: timeUntilSeconds,
          days: timeUntilDays
        }
      }
    }
  }
}

export type EventQuickListItem = {
  definition: RecurringEventDefinition;
  occurrence: EventOccurrence;
  isOverdue: boolean;
  nextOccurrenceDate: {
    date: moment.Moment;
    timeUntil: {
      seconds: number;
      days: number;
    }
  },
}

