import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFrequencyFormComponent } from './event-frequency-form.component';

describe('EventFrequencyFormComponent', () => {
  let component: EventFrequencyFormComponent;
  let fixture: ComponentFixture<EventFrequencyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventFrequencyFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventFrequencyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
