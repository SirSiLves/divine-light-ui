import { TestBed } from '@angular/core/testing';

import { AiCustomService } from './ai-custom.service';

describe('AiCustomService', () => {
  let service: AiCustomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiCustomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
