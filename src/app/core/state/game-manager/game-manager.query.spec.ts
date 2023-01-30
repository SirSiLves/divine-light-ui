import { GameManagerQuery } from './game-manager.query';
import { GameManagerStore } from './game-manager.store';

describe('GameManagerQuery', () => {
  let query: GameManagerQuery;

  beforeEach(() => {
    query = new GameManagerQuery(new GameManagerStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
