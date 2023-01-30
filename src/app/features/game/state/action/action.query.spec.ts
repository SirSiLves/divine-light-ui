import { ActionQuery } from './action.query';
import { ActionStore } from './action.store';

describe('ActionQuery', () => {
  let query: ActionQuery;

  beforeEach(() => {
    query = new ActionQuery(new ActionStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
