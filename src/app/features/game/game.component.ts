import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameManagerService } from '../../core/state/game-manager/game-manager.service';
import { PlayerQuery } from './state/player/player.query';
import { GodType, Player } from './state/player/player.model';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { GameManagerQuery } from '../../core/state/game-manager/game-manager.query';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  winner$ = this.playerQuery.winner$;
  draw$ = this.playerQuery.draw$;
  PlayerType = GodType;
  openWinner: boolean = true;
  openDraw: boolean = true;
  openPoll: boolean = true;

  poll$ = this.gameManagerQuery.polling$;


  constructor(
    private playerQuery: PlayerQuery,
    private gameManagerService: GameManagerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private gameManagerQuery: GameManagerQuery
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: params => {
        const p1: Player = this.playerQuery.getPlayer1();
        if (params['nanahuatzin'] === 'p1' && p1.godType === GodType.CAMAXTLI) {
          this.gameManagerService.swapAll();
        } else if (params['camaxtli'] === 'p1' && p1.godType === GodType.NANAHUATZIN) {
          this.gameManagerService.swapAll();
        }
      }
    });

    this.gameManagerService.loadData();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  rematch(): void {
    this.gameManagerService.rematch();
  }

  new(): void {
    this.gameManagerService.newGame();
  }


}
