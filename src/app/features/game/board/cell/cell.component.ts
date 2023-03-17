import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GameManagerQuery } from '../../../../core/state/game-manager/game-manager.query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColorMapping, GodType } from '../../state/player/player.model';
import { ActionService } from '../../state/action/action.service';
import { ActionQuery } from '../../state/action/action.query';
import { MatrixQuery } from '../../state/matrix/matrix.query';
import { PlayerQuery } from '../../state/player/player.query';
import { LightService } from '../../light/light.service';
import { MatrixStore } from '../../state/matrix/matrix.store';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  displayCellIDs$ = this.gameManagerQuery.displayCellIDs$;

  colorMapping!: ColorMapping;

  @Input() coordinateX!: number;
  @Input() coordinateY!: number;
  @Input() cellID!: number;

  maxCoordinateX = MatrixStore.WIDTH_NUMBER - 1;
  maxCoordinateY = MatrixStore.HEIGHT_NUMBER - 1;

  isSafeZoneP1 = false;
  isSafeZoneP2 = false;

  isPossible = false;
  isClicked = false;
  isDestroy = false;
  isHistoryFrom = false;
  isHistoryTo = false;

  lightOff$ = this.lightService.lightOff$;

  constructor(
    private gameManagerQuery: GameManagerQuery,
    private actionService: ActionService,
    private actionQuery: ActionQuery,
    private matrixQuery: MatrixQuery,
    private lightService: LightService,
    private playerQuery: PlayerQuery
  ) {
  }

  ngOnInit(): void {
    this.initActionResults();
    this.initSafeZone();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  private initActionResults(): void {
    this.actionQuery.possibleWalks$.pipe(takeUntil(this.onDestroy$)).subscribe(walkFields => {
      if (walkFields) {
        const targetField = walkFields.find(w => w.to.x === this.coordinateX && w.to.y === this.coordinateY);
        this.isPossible = !!targetField;
      } else {
        this.isPossible = false;
      }
    });

    this.actionQuery.preparedMove$.pipe(takeUntil(this.onDestroy$)).subscribe(prepare =>
      this.isClicked = !!(prepare && prepare.from.x === this.coordinateX && prepare.from.y === this.coordinateY)
    );

    this.actionQuery.selectActive().pipe(takeUntil(this.onDestroy$)).subscribe(action => {
      if (action?.destroy?.position.x === this.coordinateX && action?.destroy?.position.y === this.coordinateY) {
        this.isDestroy = true;
        this.isHistoryFrom = false;
        this.isHistoryTo = false;
      } else if (action?.move?.position.x === this.coordinateX && action?.move?.position.y === this.coordinateY) {
        this.isHistoryFrom = true;
        this.isDestroy = false;
        this.isHistoryTo = false;
      } else if (action?.move?.to?.x === this.coordinateX && action?.move?.to.y === this.coordinateY) {
        this.isHistoryTo = true;
        this.isDestroy = false;
        this.isHistoryFrom = false;
      } else {
        this.isDestroy = false;
        this.isHistoryFrom = false;
        this.isHistoryTo = false;
      }
    });
  }

  doMove(): void {
    this.actionService.doOrPrepareMove(this.coordinateX, this.coordinateY);
  }

  private initSafeZone(): void {
    this.playerQuery.colorMapping$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(mapping => this.colorMapping = mapping);

    // safe-zone color: https://codepen.io/sosuke/pen/Pjoqqp
    const matrix: number[][] = this.matrixQuery.getLatestMatrixState();

    if (this.coordinateX === matrix[0].length - 1
      || (this.coordinateX === 1 && this.coordinateY === matrix.length - 1)
      || (this.coordinateX === 1 && this.coordinateY === 0)) {
      this.isSafeZoneP1 = true;
    }

    if (this.coordinateX === 0
      || (this.coordinateX === matrix[0].length - 2 && this.coordinateY === 0)
      || (this.coordinateX === matrix[0].length - 2 && this.coordinateY === matrix.length - 1)) {
      this.isSafeZoneP2 = true;
    }
  }

  getXAxisValue(): string {
    if (this.playerQuery.colorMapping$.value.p1.godType === GodType.CAMAXTLI) {
      return 'abcdefg'.charAt(this.coordinateX);
    } else {
      return 'gfedcba'.charAt(this.coordinateX);
    }
  }

  getYAxisValue(): string {
    if (this.playerQuery.colorMapping$.value.p1.godType === GodType.CAMAXTLI) {
      return '654321'.charAt(this.coordinateY);
    } else {
      return '123456'.charAt(this.coordinateY);
    }
  }

}
