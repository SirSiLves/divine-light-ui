import { PlayerQuery } from './player.query';
import { PlayerStore } from './player.store';

describe('PlayerQuery', () => {
  let query: PlayerQuery;

  beforeEach(() => {
    query = new PlayerQuery(new PlayerStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
