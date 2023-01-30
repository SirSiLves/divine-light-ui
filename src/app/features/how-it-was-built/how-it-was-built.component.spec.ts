import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowItWasBuiltComponent } from './how-it-was-built.component';

describe('GameComponent', () => {
  let component: HowItWasBuiltComponent;
  let fixture: ComponentFixture<HowItWasBuiltComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HowItWasBuiltComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HowItWasBuiltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
