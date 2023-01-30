import { GameManagerStore } from './game-manager.store';

describe('GameManagerStore', () => {
  let store: GameManagerStore;

  beforeEach(() => {
    store = new GameManagerStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
