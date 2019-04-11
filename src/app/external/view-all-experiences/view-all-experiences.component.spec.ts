import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllExperiencesComponent } from './view-all-experiences.component';

describe('ViewAllExperiencesComponent', () => {
  let component: ViewAllExperiencesComponent;
  let fixture: ComponentFixture<ViewAllExperiencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAllExperiencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAllExperiencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
