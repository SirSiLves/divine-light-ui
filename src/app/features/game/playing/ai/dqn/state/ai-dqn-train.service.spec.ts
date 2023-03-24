import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AiDqnTrainService } from './ai-dqn-train.service';
import { AiDqnTrainStore } from './ai-dqn-train.store';

describe('AiDqnTrainService', () => {
  let aiDqnTrainService: AiDqnTrainService;
  let aiDqnTrainStore: AiDqnTrainStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AiDqnTrainService, AiDqnTrainStore],
      imports: [ HttpClientTestingModule ]
    });

    aiDqnTrainService = TestBed.inject(AiDqnTrainService);
    aiDqnTrainStore = TestBed.inject(AiDqnTrainStore);
  });

  it('should be created', () => {
    expect(aiDqnTrainService).toBeDefined();
  });

});
