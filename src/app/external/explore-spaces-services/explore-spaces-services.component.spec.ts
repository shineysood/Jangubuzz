import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreSpacesServicesComponent } from './explore-spaces-services.component';

describe('ExploreSpacesServicesComponent', () => {
  let component: ExploreSpacesServicesComponent;
  let fixture: ComponentFixture<ExploreSpacesServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreSpacesServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreSpacesServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
