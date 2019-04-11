import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperiencesNearYouComponent } from './experiences-near-you.component';

describe('ExperiencesNearYouComponent', () => {
  let component: ExperiencesNearYouComponent;
  let fixture: ComponentFixture<ExperiencesNearYouComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExperiencesNearYouComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperiencesNearYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
