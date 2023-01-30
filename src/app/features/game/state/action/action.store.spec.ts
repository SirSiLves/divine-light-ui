import { ActionStore } from './action.store';

describe('ActionStore', () => {
  let store: ActionStore;

  beforeEach(() => {
    store = new ActionStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
