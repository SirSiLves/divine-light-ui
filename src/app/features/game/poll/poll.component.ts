import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {

  // TODO add queryparam user / admin
  // TODO ask on admin url for login page
  // TODO only allow simulator on admin
  // TODO add queryparam for starting poll-workflow with current step
  // TODO if poll-workflow, hide setting button open info area an start with mcts
  // TODO if route mcts, set step 2 and open next dqn
  // TODO if route dqn, set step 3 and open next minimax
  // TODO if route minimax, set step 4 and open next custom

  @Input() open!: boolean;
  @Output() openChange = new EventEmitter<boolean>();

  displayModal: boolean = true;

  ngOnInit(): void {

  }

  escape(): void {
    this.openChange.next(false)
  }


}
