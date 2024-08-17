import {Component, computed, effect, model, output, signal, WritableSignal} from '@angular/core';
import {CardModule} from "primeng/card";
import {Button} from "primeng/button";
import {RouterLink} from "@angular/router";
import {CalendarModule} from "primeng/calendar";
import {FormsModule} from "@angular/forms";
import moment from "moment";

export type EventQuickListDateRange = {
  startDate: moment.Moment;
  endDate: moment.Moment;
}

@Component({
  selector: 'app-event-quick-list-toolbar',
  standalone: true,
  imports: [
    CardModule,
    Button,
    RouterLink,
    CalendarModule,
    FormsModule
  ],
  templateUrl: './event-quick-list-toolbar.component.html',
  styleUrl: './event-quick-list-toolbar.component.less'
})
export class EventQuickListToolbarComponent {

  private _paydayMoment = signal<moment.Moment | undefined>(moment.utc());

  public setDate(date: Date | undefined) {
    const parsedDate = date
     ? moment(date)
      : undefined;

    this._paydayMoment.set(parsedDate);
  }

  public computedDateRange = computed<EventQuickListDateRange>(() => {
    if (!this._paydayMoment()) {
      const startDate = moment.utc();
      const endDate = startDate.add(1, 'month');
      return {
        startDate: startDate,
        endDate
      };
    }

    const startDate = this._paydayMoment()!.subtract(1, 'month');
    const endDate = this._paydayMoment()!.subtract(1, 'day');
    return {
      startDate,
      endDate
    };
  });

  public dateRangeChanged = output<EventQuickListDateRange>();

  constructor() {
    effect(() => {
      this.dateRangeChanged.emit(this.computedDateRange());
    });
  }
}
