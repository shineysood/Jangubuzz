import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBookingCardComponent } from './chat-booking-card.component';

describe('ChatBookingCardComponent', () => {
  let component: ChatBookingCardComponent;
  let fixture: ComponentFixture<ChatBookingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatBookingCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatBookingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
