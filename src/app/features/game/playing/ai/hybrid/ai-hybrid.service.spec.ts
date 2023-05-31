import { TestBed } from '@angular/core/testing';

import { AiHybridService } from './ai-hybrid.service';

describe('HybridService', () => {
  let service: AiHybridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiHybridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
