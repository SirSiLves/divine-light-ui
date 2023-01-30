import { createInitialState, ThemeState, ThemeStore } from './theme.store';

describe('ThemeStore', () => {
  let store: ThemeStore;

  beforeEach(() => {
    store = new ThemeStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

  describe('createInitialState', () => {
    it('should createInitialState', () => {
      expect(createInitialState()).toEqual({} as ThemeState);
    });
  });
});
