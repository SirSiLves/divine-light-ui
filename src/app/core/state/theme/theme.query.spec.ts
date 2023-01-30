import { ThemeQuery } from './theme.query';
import { ThemeStore, ThemeType } from './theme.store';

describe('ThemeQuery', () => {
  let query: ThemeQuery;

  beforeEach(() => {
    query = new ThemeQuery(new ThemeStore());
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

  it('theme$', (done) => {
    query.__store__._setState({ theme: ThemeType.DARK });
    query.theme$.subscribe(theme => {
      expect(theme).toEqual(ThemeType.DARK);
      done();
    });
  });

});
