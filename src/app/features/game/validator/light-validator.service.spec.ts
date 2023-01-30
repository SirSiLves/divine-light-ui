import { TestBed } from '@angular/core/testing';

import { LightValidatorService } from './light-validator.service';

describe('LightValidatorService', () => {
  let service: LightValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LightValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
