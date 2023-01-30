import { TestBed } from '@angular/core/testing';

import { AiMinimaxingService } from './ai-minimaxing.service';

describe('AiMinimaxingService', () => {
  let service: AiMinimaxingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiMinimaxingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
