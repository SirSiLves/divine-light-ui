import { LanguageStore } from './language.store';

describe('LanguageStore', () => {
  let store: LanguageStore;

  beforeEach(() => {
    store = new LanguageStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
