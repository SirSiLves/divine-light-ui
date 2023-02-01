import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { ActionQuery } from '../../features/game/state/action/action.query';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  animations: [
    trigger('slide', [
      transition('* => *', [
        query(':enter', [
          style({transform: 'scaleX(0)', 'transform-origin': '0% 50%'}),
          stagger(150, [
            animate('200ms ease-out', style({transform: 'scaleX(1)'}))
          ])
        ], {optional: true}),
        query(':leave', [
          style({transform: 'scaleX(1)', opacity: '1'}),
          stagger(-50, [
            animate('100ms ease-out', style({transform: 'scaleX(0)', opacity: '0'}))
          ])
        ], {optional: true})
      ]),
    ])
  ]
})
export class MenuComponent implements OnInit, OnDestroy {

  readonly MENU = {
    HOME: '/',
    NEWS: '/news',
    GAME: '/game',
    HOWTO: '/how-to-play',
    ABOUT: '/about',
    DSGVO: '/dsgvo',
    IMPRESSUM: '/impressum'
  };

  MENU_LIST = [
    {
      url: this.MENU.NEWS,
      label: 'news'
    },
    {
      url: this.MENU.GAME,
      label: 'game'
    },
    {
      url: this.MENU.HOWTO,
      label: 'howtoplay'
    },
    {
      url: this.MENU.ABOUT,
      label: 'about'
    },
  ];

  lastVisited = '/';

  private onDestroy$ = new Subject<void>();

  open = false;
  back = false;
  isAnimating = false;
  showScoreBoard = false;

  constructor(
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private actionQuery: ActionQuery
  ) {
  }

  ngOnInit(): void {
    // set menu
    this.router.events.pipe(takeUntil(this.onDestroy$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.lastVisited = event.url === '/' ? '/news' : event.url;

        this.showScoreBoard = this.lastVisited.includes(this.MENU.GAME);
      }
    });

    this.location.onUrlChange(url => this.back = url !== '/search');


    this.actionQuery.preparedMove$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.close();
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  isLastVisited(url: string): boolean {
    return this.lastVisited.includes(url);
  }

  openPage(path: string): void {
    this.router.navigateByUrl(path).then(() => {
      console.log('ON PAGE PROMISE');
      this.lastVisited = this.router.url;
    });
  }

  onAnimationEvent(state: boolean): void {
    this.isAnimating = state;
  }

  setOpen(): void {
    if (this.isAnimating) {
      return;
    }

    this.open = !this.open;
  }

  close(): void {
    if (this.isAnimating) {
      setTimeout(() => {
        this.close();
      }, 250);
    } else {
      this.open = false;
    }
  }
}
