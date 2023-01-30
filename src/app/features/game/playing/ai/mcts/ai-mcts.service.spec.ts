import { TestBed } from '@angular/core/testing';

import { AiMctsService } from './ai-mcts.service';

describe('AiMctsService', () => {
  let service: AiMctsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiMctsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
