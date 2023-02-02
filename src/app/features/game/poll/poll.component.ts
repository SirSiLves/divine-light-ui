import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {

  private readonly LOCAL_STORAGE_KEY = 'divine-light-poll';

  // TODO add queryparam for starting poll-workflow with current step
  // TODO if poll-workflow, hide setting button open info area an start with mcts
  // TODO if route mcts, set step 2 and open next dqn
  // TODO if route dqn, set step 3 and open next minimax
  // TODO if route minimax, set step 4 and open next custom

  @Input() open!: boolean;
  @Output() openChange = new EventEmitter<boolean>();

  displayModal: boolean = false;

  step: 'start' | 'mcts' | 'dqn' | 'minimax' | 'questions' | 'end' = 'start'

  constructor() {
  }

  ngOnInit(): void {
    const item = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (item !== 'end') {
      this.displayModal = true;
    }
  }

  escape(): void {
    this.openChange.next(false)
  }

  back(): void {
    if (this.step === 'end') this.step = 'questions';
    else if (this.step === 'questions') this.step = 'minimax';
    else if (this.step === 'minimax') this.step = 'dqn';
    else if (this.step === 'dqn') this.step = 'mcts';
    else if (this.step === 'mcts') this.step = 'start';

    localStorage.setItem(this.LOCAL_STORAGE_KEY, this.step);
  }

  next(): void {
    if (this.step === 'start') this.step = 'mcts';
    else if (this.step === 'mcts') this.step = 'dqn';
    else if (this.step === 'dqn') this.step = 'minimax';
    else if (this.step === 'minimax') this.step = 'questions';
    else if (this.step === 'questions') this.step = 'end';

    localStorage.setItem(this.LOCAL_STORAGE_KEY, this.step);
  }
}
