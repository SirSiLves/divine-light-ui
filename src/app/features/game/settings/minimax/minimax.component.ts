import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GameManagerService } from '../../../../core/state/game-manager/game-manager.service';
import { takeUntil } from 'rxjs/operators';
import { GameManagerQuery } from '../../../../core/state/game-manager/game-manager.query';
import { Subject } from 'rxjs';
import { AiMinimaxingService } from '../../playing/ai/minimaxing/ai-minimaxing.service';

@Component({
  selector: 'app-minimax',
  templateUrl: './minimax.component.html',
  styleUrls: ['./minimax.component.scss']
})
export class MinimaxComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  @Input() extension!: 1 | 2 | 3 | 4 | 5
  @Output() extensionChange$ = new EventEmitter<1 | 2 | 3 | 4 | 5>();

  settingsLoading = false;

  constructor(
    private gameManagerService: GameManagerService,
    private gameManagerQuery: GameManagerQuery
  ) {
  }

  ngOnInit(): void {
    this.gameManagerQuery.isLoading$.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: isLoading => this.settingsLoading = isLoading
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  setExtension(): void {
    if (this.extension === AiMinimaxingService.EXTENSION_SETTING) return;
    this.extensionChange$.next(this.extension);
  }

}
