import { TestBed } from '@angular/core/testing';

import { AiDqn5Service } from './ai-dqn-5.service';

describe('AiDqn5Service', () => {
  let service: AiDqn5Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiDqn5Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
