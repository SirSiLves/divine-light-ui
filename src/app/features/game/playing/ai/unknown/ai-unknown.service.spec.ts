import { TestBed } from '@angular/core/testing';

import { AiUnknownService } from './ai-unknown.service';

describe('UnknownService', () => {
  let service: AiUnknownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiUnknownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
