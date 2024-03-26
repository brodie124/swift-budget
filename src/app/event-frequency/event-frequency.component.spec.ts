import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFrequencyComponent } from './event-frequency.component';

describe('EventFrequencyComponent', () => {
  let component: EventFrequencyComponent;
  let fixture: ComponentFixture<EventFrequencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventFrequencyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventFrequencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
