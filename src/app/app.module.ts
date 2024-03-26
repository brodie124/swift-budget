import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { EventFrequencyComponent } from './event-frequency/event-frequency.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EventFrequencyFormComponent } from './compnents/event-frequency-form/event-frequency-form.component';

@NgModule({
  declarations: [
    AppComponent,
    EventFrequencyComponent,
    EventFrequencyFormComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
