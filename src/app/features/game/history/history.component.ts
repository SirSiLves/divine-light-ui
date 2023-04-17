import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PgnLoaderComponent } from '../settings/pgn-loader/pgn-loader.component';
import { Pgn } from '../state/action/action.model';
import { ActionQuery } from '../state/action/action.query';
import { ActionService } from '../state/action/action.service';
import { PlayerQuery } from '../state/player/player.query';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  actions$: Observable<Pgn[]> = this.actionQuery.selectAll().pipe(
    map(actions => actions.map(action => {
        this.active = undefined;
        return {
          id: action.id,
          pgn: PgnLoaderComponent.getActionToPGN(action, this.playerQuery.colorMapping$.value.p1.godType)
        }
      }).reverse()
    ));

  active: Pgn | undefined;

  constructor(
    private actionQuery: ActionQuery,
    private actionService: ActionService,
    private playerQuery: PlayerQuery,
  ) {
  }

  ngOnInit(): void {
    this.actionQuery.isHistory$.pipe(takeUntil(this.onDestroy$)).subscribe(state => {
      if (!state) {
        this.active = undefined;
        this.actionService.loadLast();
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  load(pgn: Pgn): void {
    this.active = pgn;
    this.actionService.loadHistory(pgn.id);
  }

  getCount(index: number, size: number): string {
    return (size - index) + '. ';
  }
}
