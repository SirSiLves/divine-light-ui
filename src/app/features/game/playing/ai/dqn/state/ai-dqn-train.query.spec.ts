import { AiDqnTrainQuery } from './ai-dqn-train.query';
import { AiDqnTrainStore } from './ai-dqn-train.store';

describe('AiDqnTrainQuery', () => {
  let query: AiDqnTrainQuery;

  beforeEach(() => {
    query = new AiDqnTrainQuery(new AiDqnTrainStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
