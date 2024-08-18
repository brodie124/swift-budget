import {Component, computed, effect, inject, output, signal} from '@angular/core';
import {CardModule} from "primeng/card";
import {Button} from "primeng/button";
import {RouterLink} from "@angular/router";
import {CalendarModule} from "primeng/calendar";
import {FormsModule} from "@angular/forms";
import moment from "moment";
import {
  EventQuickListToolbarPreferencesService
} from "../../../../services/event-quick-list-toolbar-preferences.service";
import {getMomentUtc} from "../../../../utils/moment-utils";
import {NgStyle} from "@angular/common";

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
    FormsModule,
    NgStyle
  ],
  templateUrl: './event-quick-list-toolbar.component.html',
  styleUrl: './event-quick-list-toolbar.component.less'
})
export class EventQuickListToolbarComponent {
  private _toolbarPreferencesService: EventQuickListToolbarPreferencesService = inject(EventQuickListToolbarPreferencesService);

  private _paydayMoment = signal<moment.Moment | undefined>(getMomentUtc());
  protected paydayDate = computed(() => this._paydayMoment()?.toDate())

  public setDate(date: Date | undefined) {
    const parsedDate = date
      ? moment(date)
      : undefined;

    this._paydayMoment.set(parsedDate);
    this._toolbarPreferencesService.payday = parsedDate;
  }

  public computedDateRange = computed<EventQuickListDateRange>(() => {
    if (!this._paydayMoment()) {
      const startDate = getMomentUtc();
      const endDate = startDate.clone().add(1, 'month');
      return {
        startDate: startDate,
        endDate
      };
    }

    const startDate = this._paydayMoment()!.clone().subtract(1, 'month');
    const endDate = this._paydayMoment()!.clone().subtract(1, 'day');
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

  ngOnInit(): void {
    this._paydayMoment.set(this._toolbarPreferencesService.payday ?? undefined);
  }

  highlightCalendarDate(primeNgDate: PrimeNgDate): boolean {
    const dateString = `${primeNgDate.year}-${primeNgDate.month + 1}-${primeNgDate.day}`;
    const date = moment(dateString, 'YYYY-MM-DD');

    const dateRange = this.computedDateRange();
    return date.isSameOrAfter(dateRange.startDate) && date.isSameOrBefore(dateRange.endDate);
  }
}

export type PrimeNgDate = {
  day: number;
  month: number;
  year: number;
  selectable: boolean;
  today: boolean;
}
