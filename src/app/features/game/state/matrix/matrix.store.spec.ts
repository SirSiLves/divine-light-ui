import { MatrixStore } from './matrix.store';

describe('MatrixStore', () => {
  let store: MatrixStore;

  beforeEach(() => {
    store = new MatrixStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
