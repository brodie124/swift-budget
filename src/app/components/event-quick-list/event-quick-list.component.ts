import {Component, computed, inject, input} from '@angular/core';
import {FinancialEvent, FinancialEventHistory, FinancialEventOccurrence} from "../../types/financial/financial-event";
import moment from "moment";
import {compareMomentsAscending} from "../../helpers/moment-utils";
import {FinancialEventService} from "../../services/financial-event.service";
import {getMomentUtc} from "../../utils/moment-utils";

@Component({
  selector: 'app-event-quick-list',
  templateUrl: './event-quick-list.component.html',
  styleUrls: ['./event-quick-list.component.less']
})
export class EventQuickListComponent {

  private readonly _financialEventService: FinancialEventService = inject(FinancialEventService);

  public readonly events = input.required<ReadonlyArray<FinancialEvent>>();
  public readonly startDate = input.required<moment.Moment>();
  public readonly endDate = input.required<moment.Moment>();

  public readonly items = computed(() => {
    const calculatedEvents = this._financialEventService.getCalculatedEvents(this.events(), this.startDate(), this.endDate());
    return calculatedEvents
      .map(this.createQuickListItem)
      .sort((a, b) => compareMomentsAscending(a.nextOccurrence.date, b.nextOccurrence.date));
  });

  private createQuickListItem(calculatedEvent: FinancialEventOccurrence): EventQuickListItem {
    const timeUntilSeconds = calculatedEvent.date.diff(getMomentUtc(), 'seconds', false);

    return {
      history: calculatedEvent.history,
      financialEvent: calculatedEvent.event,
      calculatedEvent: calculatedEvent,
      nextOccurrence: {
        date: calculatedEvent.date,
        timeUntil: {
          seconds: timeUntilSeconds,
          days: timeUntilSeconds / 86400
        }
      }
    }
  }
}

export type EventQuickListItem = {
  financialEvent: FinancialEvent;
  calculatedEvent: FinancialEventOccurrence;
  history: FinancialEventHistory;
  nextOccurrence: {
    date: moment.Moment;
    timeUntil: {
      seconds: number;
      days: number;
    }
  },
}

