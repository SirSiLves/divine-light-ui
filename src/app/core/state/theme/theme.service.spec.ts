import {DOCUMENT} from '@angular/common';
import {TestBed} from '@angular/core/testing';

import {ThemeService} from './theme.service';
import {ThemeStore} from './theme.store';

describe('ThemeService', () => {
  let themeService: ThemeService;
  let themeStore: ThemeStore;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeService, ThemeStore],
    });

    themeService = TestBed.inject(ThemeService);
    themeStore = TestBed.inject(ThemeStore);
    document = TestBed.inject(DOCUMENT);
  });

  it('should be created', () => {
    expect(themeService).toBeDefined();
  });

});
