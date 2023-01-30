import { PlayerStore } from './player.store';

describe('PlayerStore', () => {
  let store: PlayerStore;

  beforeEach(() => {
    store = new PlayerStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
