import { TestBed } from '@angular/core/testing';

import { AiDqnService } from './ai-dqn.service';

describe('AiDqnService', () => {
  let service: AiDqnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiDqnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
