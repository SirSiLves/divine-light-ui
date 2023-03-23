import { AiDqnTrainStore } from './ai-dqn-train.store';

describe('AiDqnTrainStore', () => {
  let store: AiDqnTrainStore;

  beforeEach(() => {
    store = new AiDqnTrainStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
