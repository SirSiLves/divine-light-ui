import { LanguageQuery } from './language.query';
import { LanguageStore } from './language.store';

describe('LanguageQuery', () => {
  let query: LanguageQuery;

  beforeEach(() => {
    query = new LanguageQuery(new LanguageStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
