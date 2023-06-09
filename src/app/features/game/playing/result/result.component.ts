import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColorMapping, Player } from '../../state/player/player.model';
import { PlayerQuery } from '../../state/player/player.query';
import { PollComponent } from '../../poll/poll.component';
import { GameManagerQuery } from '../../../../core/state/game-manager/game-manager.query';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  player1$?: Observable<Player | undefined>;
  player2$?: Observable<Player | undefined>;

  colorMapping?: ColorMapping;

  poll$ = this.gameManagerQuery.polling$;

  constructor(
    private playerQuery: PlayerQuery,
    private gameManagerQuery: GameManagerQuery
  ) {
  }

  ngOnInit(): void {
    const p1 = this.playerQuery.getPlayer1().id;
    this.player1$ = this.playerQuery.player$(p1);

    const p2 = this.playerQuery.getPlayer2().id;
    this.player2$ = this.playerQuery.player$(p2);

    this.playerQuery.colorMapping$.pipe(takeUntil(this.onDestroy$)).subscribe(cm => this.colorMapping = cm);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
