import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DqnComponent } from './dqn.component';

describe('DqnComponent', () => {
  let component: DqnComponent;
  let fixture: ComponentFixture<DqnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DqnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DqnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
