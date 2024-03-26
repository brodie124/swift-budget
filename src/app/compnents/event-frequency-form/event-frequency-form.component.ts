import { Component } from '@angular/core';
import {C} from "@angular/cdk/keycodes";
import {CalendarDay} from "../../event-frequency/event-frequency.component";

@Component({
  selector: 'app-event-frequency-form',
  templateUrl: './event-frequency-form.component.html',
  styleUrls: ['./event-frequency-form.component.css']
})
export class EventFrequencyFormComponent {

  public frequency?: 'daily' | 'weekly' | 'monthly' | 'annually' | string;

  public setFrequency(event: Event) {
    this.frequency = (event.target as HTMLInputElement).value;
    console.log(`Frequency set to ${this.frequency}`);
  }

  protected readonly C = C;
  protected readonly CalendarDay = CalendarDay;
}
