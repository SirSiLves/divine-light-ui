import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ThemeType } from '../../core/state/theme/theme.store';
import { ThemeService } from '../../core/state/theme/theme.service';
import { ThemeQuery } from '../../core/state/theme/theme.query';
import { PrimeIcons } from 'primeng/api';
import { Theme } from '../../core/state/theme/theme';
import { takeUntil } from 'rxjs/operators';
import { GameManagerQuery } from '../../core/state/game-manager/game-manager.query';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  isLoading$ = this.gameManagerQuery.isLoading$;

  readonly THEMES = [
    {label: 'Light', value: ThemeType.LIGHT, icon: PrimeIcons.SUN},
    {label: 'Dark', value: ThemeType.DARK, icon: PrimeIcons.MOON}
  ] as Theme[];

  theme?: ThemeType;

  checked = true;

  constructor(
    private themeService: ThemeService,
    private themeQuery: ThemeQuery,
    private gameManagerQuery: GameManagerQuery
  ) {
  }

  ngOnInit(): void {
    this.initThemes();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  private initThemes(): void {
    this.themeQuery.theme$.pipe(takeUntil(this.onDestroy$)).subscribe(theme => {
      this.theme = theme;
    });
  }

  switchTheme(): void {
    if (this.theme === this.THEMES[0].value) {
      // dark
      this.themeService.setTheme(this.THEMES[1].value);
      this.checked = true;
    } else {
      // white
      this.themeService.setTheme(this.THEMES[0].value);
      this.checked = false;
    }
  }

}
