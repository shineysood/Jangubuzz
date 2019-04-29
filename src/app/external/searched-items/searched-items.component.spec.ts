import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchedItemsComponent } from './searched-items.component';

describe('SearchedItemsComponent', () => {
  let component: SearchedItemsComponent;
  let fixture: ComponentFixture<SearchedItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchedItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchedItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
