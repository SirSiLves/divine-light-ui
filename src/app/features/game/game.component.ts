import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameManagerService } from '../../core/state/game-manager/game-manager.service';
import { PlayerQuery } from './state/player/player.query';
import { GodType, Player } from './state/player/player.model';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';


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

  constructor(
    private playerQuery: PlayerQuery,
    private gameManagerService: GameManagerService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  rematch(): void {
    this.gameManagerService.rematch();
  }

  new(): void {
    this.gameManagerService.newGame();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: params => {
        const p1: Player = this.playerQuery.getPlayer1();

        if (params['nanahuatzin'] === 'p1' && p1.godType === GodType.CAMAXTLI) {
          this.gameManagerService.swapGods();
        } else if (params['camaxtli'] === 'p1' && p1.godType === GodType.NANAHUATZIN) {
          this.gameManagerService.swapGods();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }


}
