import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { PlayerQuery } from '../../state/player/player.query';
import { GameManagerService } from '../../../../core/state/game-manager/game-manager.service';
import { GameManagerQuery } from '../../../../core/state/game-manager/game-manager.query';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss']
})
export class DrawComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  @Input() open!: boolean;
  @Output() openChange = new EventEmitter<boolean>();

  displayModal: boolean = false;

  constructor(
    private playerQuery: PlayerQuery,
    private gameManagerService: GameManagerService,
    private gameManagerQuery: GameManagerQuery
  ) {
  }

  ngOnInit(): void {
    this.playerQuery.draw$.pipe(takeUntil(this.onDestroy$)).subscribe(state => {
      if (state) {
        this.openChange.next(true);
        this.displayModal = true;

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
