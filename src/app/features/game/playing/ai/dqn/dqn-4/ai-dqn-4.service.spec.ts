import { TestBed } from '@angular/core/testing';

import { AiDqn4Service } from './ai-dqn-4.service';

describe('AiDqn4Service', () => {
  let service: AiDqn4Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiDqn4Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
