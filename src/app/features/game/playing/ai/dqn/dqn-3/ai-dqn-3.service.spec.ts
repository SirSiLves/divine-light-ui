import { TestBed } from '@angular/core/testing';

import { AiDqn3Service } from './ai-dqn-3.service';

describe('AiDqn3Service', () => {
  let service: AiDqn3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiDqn3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
