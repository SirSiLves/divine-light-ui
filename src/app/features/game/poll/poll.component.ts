import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GameManagerQuery } from '../../../core/state/game-manager/game-manager.query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  constructor(
    private gameManagerQuery: GameManagerQuery
  ) {
  }

  ngOnInit(): void {
    const item = localStorage.getItem(PollComponent.LOCAL_STORAGE_KEY);
    if (item) this.step = item as any;

    this.gameManagerQuery.pollOpen$.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: state => {
        this.displayModal = state;
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
    else if (this.step === 'questions') this.step = 'end';

    localStorage.setItem(PollComponent.LOCAL_STORAGE_KEY, this.step);
  }
}
