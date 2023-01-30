import { Component, OnDestroy, OnInit } from '@angular/core';
import { LanguageService } from '../../core/state/language/language.service';
import { LanguageQuery } from '../../core/state/language/language.query';
import { LanguageType } from '../../core/state/language/language.store';
import { takeUntil } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  currentDate = new Date();
  version = '0.0.1' // package.json
  language$ = this.languageQuery.language$;
  LanguageType = LanguageType;

  showGameTimeline = false;

  constructor(
    private languageService: LanguageService,
    private languageQuery: LanguageQuery,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.onDestroy$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showGameTimeline = event.url.includes('/game');
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  switchLanguage(language: LanguageType): void {
    this.languageService.setLanguage(language);
  }
}
