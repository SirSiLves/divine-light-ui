import { TestBed } from '@angular/core/testing';

import { DrawValidatorService } from './draw-validator.service';

describe('DrawValidatorService', () => {
  let service: DrawValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
