import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameManagerQuery } from '../../../core/state/game-manager/game-manager.query';
import { ColorMapping, GodType } from '../state/player/player.model';
import { Move } from '../state/action/move.model';
import { MatrixQuery } from '../state/matrix/matrix.query';
import { PlayerQuery } from '../state/player/player.query';
import { ActionQuery } from '../state/action/action.query';


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  animations: [
    trigger('slide', [
      transition('* => *', [
        query(':enter', [
          style({transform: 'scale(0)'}),
          stagger(100, [
            animate('200ms ease-out', style({transform: 'scale(1)'}))
          ])
        ], {optional: true}),
      ])
    ])
  ]
})
export class BoardComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  playing$ = this.playerQuery.isPlayingGod$;
  colorMapping!: ColorMapping;

  PlayerType = GodType;

  move!: Move | null;

  matrixSkeleton: number[][] = [];

  isAnimating = false;

  isHistory$ = this.actionQuery.isHistory$;


  constructor(
    private matrixQuery: MatrixQuery,
    private playerQuery: PlayerQuery,
    private elementRef: ElementRef,
    private gameManagerQuery: GameManagerQuery,
    private actionQuery: ActionQuery
  ) {
  }

  ngOnInit(): void {
    // create matrix skeleton
    this.createSkeleton();

    this.playerQuery.colorMapping$.pipe(takeUntil(this.onDestroy$)).subscribe(color => this.colorMapping = color);

    setTimeout(() => {
      this.elementRef.nativeElement.scrollIntoView({behavior: 'smooth', block: 'center'});
    }, 100);

    this.gameManagerQuery.reloading$.pipe(takeUntil(this.onDestroy$)).subscribe(state => {
      if (state) this.createSkeleton();
    });
  }

  ngOnDestroy() {
    this.actionQuery.isHistory$.next(false);
    this.gameManagerQuery.reloading$.next(true);
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getCellID(xI: number, yI: number): number {
    return MatrixQuery.getCellID(xI, yI);
  }

  onAnimationEvent(start: boolean): void {
    this.isAnimating = start;

    if (!start) this.gameManagerQuery.reloading$.next(start);
  }

  private createSkeleton(): void {
    this.matrixSkeleton = [];
    const matrix = this.matrixQuery.getLatestMatrixState();
    for (let y = 0; y < matrix.length; y++) {
      this.matrixSkeleton.push([]);
      for (let x = 0; x < matrix[y].length; x++) {
        this.matrixSkeleton[y].push(0);
      }
    }
  }


}
