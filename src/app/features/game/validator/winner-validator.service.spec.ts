import { TestBed } from '@angular/core/testing';

import { WinnerValidatorService } from './winner-validator.service';

describe('WinnerValidatorService', () => {
  let service: WinnerValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WinnerValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
