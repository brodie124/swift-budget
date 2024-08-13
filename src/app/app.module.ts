import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { EventFrequencyComponent } from './event-frequency/event-frequency.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EventFrequencyFormComponent } from './components/event-frequency-form/event-frequency-form.component';
import {FormsModule} from "@angular/forms";
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {AppRoutingModule} from "./app-routing.module";
import {MatButtonModule} from "@angular/material/button";
import { CreateEventComponent } from './components/create-event/create-event.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatChipsModule} from "@angular/material/chips";
import {MatRadioModule} from "@angular/material/radio";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { EventQuickListComponent } from './components/event-quick-list/event-quick-list.component';
import {MatStepperModule} from "@angular/material/stepper";

@NgModule({
  declarations: [
    AppComponent,
    EventFrequencyComponent,
    EventFrequencyFormComponent,
    DashboardComponent,
    CreateEventComponent,
    EventQuickListComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatExpansionModule,
        MatChipsModule,
        MatRadioModule,
        MatCheckboxModule,
        MatStepperModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
