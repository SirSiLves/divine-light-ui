import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotLevelComponent } from './bot-level.component';

describe('BotLevelComponent', () => {
  let component: BotLevelComponent;
  let fixture: ComponentFixture<BotLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BotLevelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
