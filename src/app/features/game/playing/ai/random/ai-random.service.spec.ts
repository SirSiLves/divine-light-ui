import { TestBed } from '@angular/core/testing';

import { AiRandomService } from './ai-random.service';

describe('AiRandomService', () => {
  let service: AiRandomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiRandomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
