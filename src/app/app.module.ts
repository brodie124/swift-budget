import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { EventFrequencyComponent } from './event-frequency/event-frequency.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EventFrequencyFormComponent } from './components/event-frequency-form/event-frequency-form.component';
import {FormsModule} from "@angular/forms";
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {AppRoutingModule} from "./app-routing.module";
import { CreateEventModalComponent } from './components/event-modals/create-event-modal/create-event-modal.component';
import { EventQuickListComponent } from './components/event-quick-list/event-quick-list.component';
import {Button} from "primeng/button";
import {StepperModule} from "primeng/stepper";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {InputNumberModule} from "primeng/inputnumber";
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
import {CheckboxModule} from "primeng/checkbox";
import {RadioButtonModule} from "primeng/radiobutton";
import {InputGroupModule} from "primeng/inputgroup";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {CardModule} from "primeng/card";
import {
    EventQuickListItemComponent
} from "./components/event-quick-list/subcomponents/event-quick-list-item/event-quick-list-item.component";
import {
  EventQuickListToolbarComponent
} from "./components/event-quick-list/subcomponents/event-quick-list-toolbar/event-quick-list-toolbar.component";
import {NavbarComponent} from "./components/navbar/navbar.component";
import {ToolbarModule} from "primeng/toolbar";
import {FirstTimeSetupComponent} from "./components/first-time-setup/first-time-setup.component";
import {UnlockModalComponent} from "./components/unlock-modal/unlock-modal.component";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {ConfirmationService, MessageService} from "primeng/api";
import {DueInDaysPipe} from "./event-due-soon.pipe";
import {EventQuickStatsComponent} from "./components/event-quick-stats/event-quick-stats.component";
import {DialogModule} from "primeng/dialog";
import {
    EventCreateEditMultiFormComponent
} from "./components/event-modals/event-create-edit-multi-form/event-create-edit-multi-form.component";
import {EditEventModalComponent} from "./components/event-modals/edit-event-modal/edit-event-modal.component";
import {AuthService} from "./services/auth.service";
import {initializeFirebase} from "./initializers/firebase-initializer";
import {provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    EventFrequencyComponent,
    EventFrequencyFormComponent,
    DashboardComponent,
    CreateEventModalComponent,
    EventQuickListComponent,
    EventQuickListItemComponent,
    EventQuickListToolbarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    Button,
    StepperModule,
    FloatLabelModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    RadioButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    CardModule,
    NavbarComponent,
    ToolbarModule,
    FirstTimeSetupComponent,
    UnlockModalComponent,
    ConfirmDialogModule,
    ToastModule,
    DueInDaysPipe,
    EventQuickStatsComponent,
    DialogModule,
    EventCreateEditMultiFormComponent,
    EditEventModalComponent,

  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    ConfirmationService,
    MessageService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AuthService],
      useFactory: initializeFirebase
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
