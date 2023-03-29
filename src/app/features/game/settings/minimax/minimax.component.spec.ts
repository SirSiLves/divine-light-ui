import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimaxComponent } from './minimax.component';

describe('MinimaxComponent', () => {
  let component: MinimaxComponent;
  let fixture: ComponentFixture<MinimaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinimaxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinimaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
