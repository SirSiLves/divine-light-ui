import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { ThemeStore, ThemeType } from './theme.store';


@Injectable({providedIn: 'root'})
export class ThemeService {

  static readonly THEME_MAP: { [key: string]: string } = {
    LIGHT: 'light',
    DARK: 'dark',
  };
  private readonly LOCAL_STORAGE_KEY = 'divine-light-theme';

  constructor(
    private themeStore: ThemeStore,
    @Inject(DOCUMENT) private document: Document,
  ) {
  }

  initTheme(): void {
    const localStorageTheme = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (localStorageTheme && ThemeService.THEME_MAP[localStorageTheme]) {
      const themeEnum = (ThemeType as never)[localStorageTheme];
      this.setTheme(themeEnum);
    } else {
      this.setTheme(ThemeType.DARK);
    }
  }

  setTheme(themeType: ThemeType): void {
    this.document.getElementById('theme-link')?.setAttribute(
      'href', `assets/themes/${ThemeService.THEME_MAP[themeType]}/theme.css`
    );
    this.document.body.classList.remove(ThemeType.LIGHT, ThemeType.DARK);
    this.document.body.classList.add(themeType);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, themeType);
    this.themeStore.update({theme: themeType});
  }

}

export function themeInitializer(themeService: ThemeService): () => void {
  return () => themeService.initTheme();
}
