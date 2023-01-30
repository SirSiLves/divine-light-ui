import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgnLoaderComponent } from './fen-loader.component';

describe('FenLoaderComponent', () => {
  let component: PgnLoaderComponent;
  let fixture: ComponentFixture<PgnLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PgnLoaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgnLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
