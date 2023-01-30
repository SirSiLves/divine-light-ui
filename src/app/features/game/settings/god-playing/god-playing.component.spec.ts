import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GodPlayingComponent } from './starting-player.component';

describe('StartingPlayerComponent', () => {
  let component: GodPlayingComponent;
  let fixture: ComponentFixture<GodPlayingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GodPlayingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GodPlayingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
