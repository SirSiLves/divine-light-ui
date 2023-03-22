import { TestBed } from '@angular/core/testing';

import { AiDqn1Service } from './ai-dqn-1.service';

describe('AiDqn1Service', () => {
  let service: AiDqn1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiDqn1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
