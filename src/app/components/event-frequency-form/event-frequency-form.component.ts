import { Component } from '@angular/core';
import { CalendarDay } from 'src/app/types/calendar/calendar-types';

type SelectedDays = {
  [key in keyof CalendarDay]: boolean;
}

@Component({
  selector: 'app-event-frequency-form',
  templateUrl: './event-frequency-form.component.html',
  styleUrls: ['./event-frequency-form.component.less']
})
export class EventFrequencyFormComponent {

  public frequency?: 'daily' | 'weekly' | 'monthly' | 'annually' | string;


  public dailySelectedDays: Map<CalendarDay, boolean> = new Map();


  public setFrequency(event: Event) {
    this.frequency = (event.target as HTMLInputElement).value;
    console.log(`Frequency set to ${this.frequency}`);
  }

  protected readonly CalendarDay = CalendarDay;
}
