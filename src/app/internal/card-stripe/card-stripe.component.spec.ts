import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardStripeComponent } from './card-stripe.component';

describe('CardStripeComponent', () => {
  let component: CardStripeComponent;
  let fixture: ComponentFixture<CardStripeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardStripeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardStripeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
