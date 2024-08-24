import {Component, effect, inject, input, OnInit, ViewChild} from '@angular/core';
import {EventFrequency} from "../../types/event/event-frequency";
import {EventTrigger, InvalidDayFallback} from "../../types/event/event";
import {AllCalendarMonths} from "../../types/calendar/calendar-types";
import {EventManagerService} from "../../services/event-manager.service";
import {Router} from "@angular/router";
import {FinancialEvent} from "../../types/financial/financial-event";
import {getMomentUtc} from "../../utils/moment-utils";
import {
  EventCreateEditMultiFormComponent
} from "../event-create-edit-multi-form/event-create-edit-multi-form.component";

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.less']
})
export class CreateEventComponent implements OnInit {
  private readonly _eventManager = inject(EventManagerService);
  private readonly _router = inject(Router);

  @ViewChild(EventCreateEditMultiFormComponent, { static: true })
  private readonly _eventCreateEditMultiForm: EventCreateEditMultiFormComponent = undefined!;

  public ngOnInit(): void {
    if (!this._eventCreateEditMultiForm)
      throw new Error('Create/Edit Multi-Form not found!');
  }

  public async create() {
    const financialEvent = await this._eventCreateEditMultiForm.createFinancialEvent();
    if (!financialEvent) {
      console.info("Couldn't create financial event");
      return;
    }

    await this._eventManager.addAsync(financialEvent);
    await this._router.navigate(['']);
  }

  public async cancel() {
    // TODO: add confirmation
    await this._router.navigate(['']);
  }
}
