import {Component, computed, effect, inject, OnInit, output, signal} from '@angular/core';
import moment from "moment";
import {
  EventQuickListToolbarPreferencesService
} from "../../../../services/event-quick-list-toolbar-preferences.service";
import {getMomentUtc} from "../../../../utils/moment-utils";

export type EventQuickListDateRange = {
  startDate: moment.Moment;
  endDate: moment.Moment;
}

@Component({
  selector: 'app-event-quick-list-toolbar',
  templateUrl: './event-quick-list-toolbar.component.html',
  styleUrl: './event-quick-list-toolbar.component.less'
})
export class EventQuickListToolbarComponent implements OnInit {
  private _toolbarPreferencesService: EventQuickListToolbarPreferencesService = inject(EventQuickListToolbarPreferencesService);

  private _paydayMoment = signal<moment.Moment | undefined>(undefined);
  protected paydayDate = computed(() => this._paydayMoment()?.toDate())

  public setDate(date: Date | undefined) {
    const parsedDate = date
      ? getMomentUtc(date)
      : undefined;

    this._paydayMoment.set(parsedDate);
    this._toolbarPreferencesService.payday = parsedDate;
  }

  public showCreateBill = signal<boolean>(false);
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

  public ngOnInit(): void {
    const endOfMonthMoment = this.endOfMonthMoment();
    this._paydayMoment.set(this._toolbarPreferencesService.payday ?? endOfMonthMoment);
  }

  highlightCalendarDate(primeNgDate: PrimeNgDate): boolean {
    const dateString = `${primeNgDate.year}-${primeNgDate.month + 1}-${primeNgDate.day}`;
    const date = getMomentUtc(dateString, 'YYYY-MM-DD');

    const dateRange = this.computedDateRange();
    return date.isSameOrAfter(dateRange.startDate) && date.isSameOrBefore(dateRange.endDate);
  }

  private endOfMonthMoment(): moment.Moment{
    const currentDate = getMomentUtc();
    currentDate.set('date', currentDate.daysInMonth());

    return currentDate;
  }

  createBill() {
    console.log("Showing create a bill");
    this.showCreateBill.set(true);
  }
}

export type PrimeNgDate = {
  day: number;
  month: number;
  year: number;
  selectable: boolean;
  today: boolean;
}
