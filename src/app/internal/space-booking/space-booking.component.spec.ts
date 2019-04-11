import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceBookingComponent } from './space-booking.component';

describe('SpaceBookingComponent', () => {
  let component: SpaceBookingComponent;
  let fixture: ComponentFixture<SpaceBookingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpaceBookingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
