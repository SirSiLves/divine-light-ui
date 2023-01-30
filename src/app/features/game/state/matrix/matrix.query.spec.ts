import { MatrixQuery } from './matrix.query';
import { MatrixStore } from './matrix.store';

describe('MatrixQuery', () => {
  let query: MatrixQuery;

  beforeEach(() => {
    query = new MatrixQuery(new MatrixStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
