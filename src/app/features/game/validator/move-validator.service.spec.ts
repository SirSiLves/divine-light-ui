import { TestBed } from '@angular/core/testing';

import { MoveValidatorService } from './move-validator.service';

describe('MoveValidatorService', () => {
  let service: MoveValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoveValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
