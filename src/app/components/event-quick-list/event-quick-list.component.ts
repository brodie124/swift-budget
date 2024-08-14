import {Component, Input} from '@angular/core';
import {FinancialEvent} from "../../types/financial/financial-event";
import {EventEngineService} from "../../services/event-engine.service";
import moment from "moment";
import {compareMomentsAscending, compareMomentsDescending} from "../../helpers/moment-utils";

@Component({
  selector: 'app-event-quick-list',
  templateUrl: './event-quick-list.component.html',
  styleUrls: ['./event-quick-list.component.less']
})
export class EventQuickListComponent {
  private _calculatedEvents: Array<CalculatedFinancialEvent> = [];
  public get calculatedEvents(): ReadonlyArray<CalculatedFinancialEvent> {
    return this._calculatedEvents;
  }


  @Input()
  public set events(value: ReadonlyArray<FinancialEvent>) {
    this._calculatedEvents = this.calculateEvents(value);
    this._calculatedEvents.sort((a, b) => compareMomentsAscending(a.nextOccurrence?.date, b.nextOccurrence?.date));
  }

  @Input()
  public startDate: moment.Moment = moment.utc(); //.subtract(1, 'month');

  @Input()
  public endDate: moment.Moment = moment.utc().add(3, 'months');


  constructor(private readonly _eventEngine: EventEngineService) {
  }

  public shouldShowReminderForEvent(event: CalculatedFinancialEvent): boolean {
    return !!event.nextOccurrence
      && !event.isPaid
      && event.nextOccurrence.timeUntil.days >= 0
      && event.nextOccurrence.timeUntil.days <= 2
  }

  private calculateEvents(events: ReadonlyArray<FinancialEvent>): Array<CalculatedFinancialEvent> {
    const x: Array<CalculatedFinancialEvent> = [];

    for (let event of events) {
      const occurrences = this._eventEngine.calculateOccurrences(event.trigger, this.startDate, this.endDate);
      const nextOccurrence = occurrences.length > 0 ? occurrences[0] : undefined;
      const timeUntilSeconds = nextOccurrence?.diff(moment(), 'seconds', false) ?? NaN;

      const nextOccurrenceX = {
        date: nextOccurrence!,
        timeUntil: {
          seconds: timeUntilSeconds,
          days: timeUntilSeconds / 86400
        }
      }

      x.push({
        event: event,
        occurrences: occurrences,
        isPaid: false,
        nextOccurrence: occurrences.length > 0
          ? nextOccurrenceX
          : undefined
      });
    }

    return x;
  }
}

export type CalculatedFinancialEvent = {
  event: FinancialEvent,
  nextOccurrence?: {
    date: moment.Moment;
    timeUntil: {
      seconds: number;
      days: number;
    }
  },
  occurrences: Array<moment.Moment>;
  isPaid: boolean;
}
