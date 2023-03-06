import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GameManagerQuery } from '../../../core/state/game-manager/game-manager.query';
import { map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PlayerQuery } from '../state/player/player.query';
import { GameManagerService } from '../../../core/state/game-manager/game-manager.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit, OnDestroy {

  public static readonly LOCAL_STORAGE_KEY = 'divine-light-poll';

  // TODO disable settings while poll is not completed
  // TODO add queryparam for starting poll-workflow with current step
  // TODO if poll-workflow, hide setting button open info area an start with minimax
  // TODO if route minimax, set step 2 and open next dqn
  // TODO end is only available if poll has been completed

  private onDestroy$ = new Subject<void>();

  @Input() open!: boolean;
  @Output() openChange = new EventEmitter<boolean>();

  displayModal: boolean = false;

  step: 'start' | 'dqn' | 'minimax' | 'questions' | 'end' = 'start'

  player1$ = this.playerQuery.player$(this.playerQuery.getPlayer1().id);
  player2$ = this.playerQuery.player$(this.playerQuery.getPlayer2().id);

  wins$ = this.playerQuery.selectAll().pipe(
    map(
      players => {
        let sum = 0;
        if (this.gameManagerQuery.polling$.value) {
          for (let i = 0; i < players.length; i++) {
            const player = players[i];
            sum += player.wins;
          }
        }

        return sum;
      }
    ));

  constructor(
    private gameManagerQuery: GameManagerQuery,
    private router: Router,
    private playerQuery: PlayerQuery,
    private gameManagerService: GameManagerService
  ) {
  }

  ngOnInit(): void {
    const item = localStorage.getItem(PollComponent.LOCAL_STORAGE_KEY);
    if (item) this.step = item as any;

    this.gameManagerQuery.polling$.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: state => {
        this.displayModal = state;
      }
    });

    this.wins$.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: wins => {
        if (wins >= 3) {
          if (this.step !== 'questions') this.next();
          this.displayModal = true;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  escape(): void {
    this.openChange.next(false)
  }

  back(): void {
    if (this.step === 'end') this.step = 'questions';
    else if (this.step === 'questions') this.step = 'dqn';
    else if (this.step === 'dqn') this.step = 'minimax';
    else if (this.step === 'minimax') this.step = 'start';

    localStorage.setItem(PollComponent.LOCAL_STORAGE_KEY, this.step);
  }

  next(): void {
    if (this.step === 'start') this.step = 'minimax';
    else if (this.step === 'minimax') this.step = 'dqn';
    else if (this.step === 'dqn') this.step = 'questions';
    else if (this.step === 'questions') this.step = 'end';

    localStorage.setItem(PollComponent.LOCAL_STORAGE_KEY, this.step);
  }

  close(): void {
    // TODO validate if poll has been send
    this.gameManagerQuery.polling$.next(false);
  }

  play(algorithm: string): void {
    switch (algorithm) {
      case 'minimax': {
        if (this.playerQuery.getPlayer2().botType !== 'minimax') this.gameManagerService.newGame();
        this.router.navigate([], {
          queryParams: {
            mode: 'p1vb',
            camaxtli: 'p1',
            nanahuatzin: 'p2',
            botTypeP2: 'minimax',
            rematch: 'manual',
            autoSwitch: true
          }
        });
        break;
      }
      case 'dqn': {
        if (this.playerQuery.getPlayer2().botType !== 'dqn') this.gameManagerService.newGame();
        this.router.navigate([], {
          queryParams: {
            mode: 'p1vb',
            camaxtli: 'p1',
            nanahuatzin: 'p2',
            botTypeP2: 'dqn',
            rematch: 'manual',
            autoSwitch: true
          }
        });
        break;
      }
    }

    this.displayModal = false;
  }

  send(): void {
    // TODO
    this.next();
  }
}
