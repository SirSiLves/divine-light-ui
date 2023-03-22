import { TestBed } from '@angular/core/testing';

import { AiTensorflowService } from './ai-tensorflow.service';

describe('AiTensorflowService', () => {
  let service: AiTensorflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiTensorflowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
