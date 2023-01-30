import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GodType, Player } from '../../state/player/player.model';
import { PlayerQuery } from '../../state/player/player.query';
import { GameManagerService } from '../../../../core/state/game-manager/game-manager.service';
import { GameManagerQuery } from '../../../../core/state/game-manager/game-manager.query';

@Component({
  selector: 'app-winner',
  templateUrl: './winner.component.html',
  styleUrls: ['./winner.component.scss']
})
export class WinnerComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  @Input() open!: boolean;
  @Output() openChange = new EventEmitter<boolean>();

  winner?: Player;
  PlayerType = GodType;
  displayModal: boolean = false;


  constructor(
    private playerQuery: PlayerQuery,
    private gameManagerService: GameManagerService,
    private gameManagerQuery: GameManagerQuery
  ) {
  }

  ngOnInit(): void {
    this.playerQuery.winner$.pipe(takeUntil(this.onDestroy$)).subscribe(winner => {
      if (winner) {
        this.winner = winner;
        this.displayModal = true;

        // workaround after check error
        setTimeout(() => {
          this.openChange.next(true);
        }, 1)

        setTimeout(() => {
          if (this.gameManagerQuery.getValue().settings.rematch === 'auto') {
            this.rematch();
          }
        }, 1000);
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  rematch(): void {
    this.displayModal = false
    this.openChange.next(false);
    this.gameManagerService.rematch();
  }

  new(): void {
    this.displayModal = false
    this.openChange.next(false);
    this.gameManagerService.newGame();
  }

  escape(): void {
    this.openChange.next(false)
  }
}
