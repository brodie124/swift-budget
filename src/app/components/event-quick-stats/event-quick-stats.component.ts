import {Component, input} from '@angular/core';
import {EventStatistics} from "../../services/financial-events/event-statistics.service";
import {DecimalPipe} from "@angular/common";

@Component({
  selector: 'app-event-quick-stats',
  standalone: true,
  imports: [
    DecimalPipe
  ],
  templateUrl: './event-quick-stats.component.html',
  styleUrl: './event-quick-stats.component.less'
})
export class EventQuickStatsComponent {

  public statistics = input.required<EventStatistics>();

  protected readonly JSON = JSON;
}
