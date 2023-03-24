import { TestBed } from '@angular/core/testing';

import { AiDqn2Service } from './ai-dqn-2.service';

describe('AiDqn2Service', () => {
  let service: AiDqn2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiDqn2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
