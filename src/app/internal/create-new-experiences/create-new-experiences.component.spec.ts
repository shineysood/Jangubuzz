import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewExperiencesComponent } from './create-new-experiences.component';

describe('CreateNewExperiencesComponent', () => {
  let component: CreateNewExperiencesComponent;
  let fixture: ComponentFixture<CreateNewExperiencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewExperiencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewExperiencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
