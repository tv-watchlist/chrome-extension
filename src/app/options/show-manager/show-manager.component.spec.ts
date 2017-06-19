import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowManagerComponent } from './show-manager.component';

describe('ShowManagerComponent', () => {
  let component: ShowManagerComponent;
  let fixture: ComponentFixture<ShowManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
