import { Injectable, OnDestroy } from '@angular/core';
import { LanguageStore, LanguageType } from './language.store';
import { Subject } from 'rxjs';
import { LanguageQuery } from './language.query';
import { PrimeNGConfig } from 'primeng/api';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({providedIn: 'root'})
export class LanguageService implements OnDestroy {

  private onDestroy$ = new Subject<void>();
  private readonly LOCAL_STORAGE_KEY = 'divine-light-language';


  constructor(
    private languageStore: LanguageStore,
    private languageQuery: LanguageQuery,
    private primeNGConfig: PrimeNGConfig,
    private translateService: TranslateService,
  ) {
  }


  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  initLanguage(): void {
    const localStorageTheme = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (localStorageTheme) {
      const themeEnum = (LanguageType as never)[localStorageTheme];
      this.setLanguage(themeEnum);
    } else {
      this.setLanguage(navigator.language === 'de' ? LanguageType.de: LanguageType.en);
    }
  }

  setLanguage(language: LanguageType): void {
    this.translateService.use(language).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.languageStore.update({language});
    });

    localStorage.setItem(this.LOCAL_STORAGE_KEY, language);
  }

}

export function languageInitializer(languageService: LanguageService): () => void {
  return () => languageService.initLanguage();
}
