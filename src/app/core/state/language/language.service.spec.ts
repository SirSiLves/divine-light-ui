import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';
import { LanguageStore } from './language.store';

describe('LanguageService', () => {
  let languageService: LanguageService;
  let languageStore: LanguageStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LanguageService, LanguageStore],
      imports: [ HttpClientTestingModule ]
    });

    languageService = TestBed.inject(LanguageService);
    languageStore = TestBed.inject(LanguageStore);
  });

  it('should be created', () => {
    expect(languageService).toBeDefined();
  });

});
