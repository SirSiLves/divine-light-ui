import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Piece, PieceType } from './piece';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { GodType } from '../../state/player/player.model';
import { ActionService } from '../../state/action/action.service';
import { ActionQuery } from '../../state/action/action.query';
import { PlayerQuery } from '../../state/player/player.query';
import { MatrixQuery } from '../../state/matrix/matrix.query';
import { MoveValidatorService } from '../../validator/move-validator.service';
import { Field } from '../../state/action/field.model';


@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.scss'],
  animations: [
    trigger('fade', [
      transition('* => UP', [
        style({transform: 'translateY(100%)'}),
        animate('300ms ease-out', style({transform: 'translateY(0)'}))
      ]),
      transition('* => UP-RIGHT', [
        style({transform: 'translateY(100%) translateX(-100%)'}),
        animate('300ms ease-out', style({transform: 'translateX(0) translateY(0)'}))
      ]),
      transition('* => RIGHT', [
        style({transform: 'translateX(-100%)'}),
        animate('300ms ease-out', style({transform: 'translateX(0)'}))
      ]),
      transition('* => RIGHT-DOWN', [
        style({transform: 'translateX(-100%) translateY(-100%)'}),
        animate('300ms ease-out', style({transform: 'translateX(0) translateY(0)'}))
      ]),
      transition('* => DOWN', [
        style({transform: 'translateY(-100%)'}),
        animate('300ms ease-out', style({transform: 'translateY(0)'}))
      ]),
      transition('* => DOWN-LEFT', [
        style({transform: 'translateY(-100%) translateX(100%)'}),
        animate('300ms ease-out', style({transform: 'translateY(0) translateX(0)'}))
      ]),
      transition('* => LEFT', [
        style({transform: 'translateX(100%)'}),
        animate('300ms ease-out', style({transform: 'translateX(0)'}))
      ]),
      transition('* => LEFT-UP', [
        style({transform: 'translateX(100%) translateY(100%)'}),
        animate('300ms ease-out', style({transform: 'translateX(0) translateY(0)'}))
      ]),
    ]),
  ]
})
export class PieceComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  piece?: Piece;

  @Input() x!: number;
  @Input() y!: number;

  PlayerType = GodType;

  rotation: string = ''
  animateRotate = '';
  animateMove: 'UP' | 'UP-RIGHT' | 'RIGHT' | 'RIGHT-DOWN' | 'DOWN' | 'DOWN-LEFT' | 'LEFT' | 'LEFT-UP' | undefined = undefined;
  pieceValue: number = 0;

  showRotate = false;
  showCancel = false;
  showSave = false;

  constructor(
    private actionService: ActionService,
    private actionQuery: ActionQuery,
    private playerQuery: PlayerQuery,
    private matrixQuery: MatrixQuery
  ) {
  }

  ngOnInit(): void {
    this.initMoveAnimation();


    // create piece if needed
    this.matrixQuery.matrixActive$.pipe(takeUntil(this.onDestroy$)).subscribe(matrix => {
      if (matrix) {
        const piece = matrix[this.y][this.x];

        if (piece !== 0) {
          if (this.piece === undefined || this.piece.id !== piece) {
            this.initPiece(piece);
          }
        } else {
          this.piece = undefined;
          this.showRotate = false;
          this.showSave = false;
          this.showCancel = false;
          this.animateRotate = '';
        }
      }
    });

    this.actionQuery.preparedMove$.pipe(takeUntil(this.onDestroy$)).subscribe(prepare => {
        if (this.piece && (
          PieceComponent.getType(this.pieceValue) !== PieceType.KING &&
          PieceComponent.getType(this.pieceValue) !== PieceType.WALL)
        ) {
          this.showRotate = !!(prepare && prepare.from.x === this.piece.x && prepare.from.y === this.piece.y)
        } else {
          this.showRotate = false;
        }
      }
    );

    this.actionQuery.reset$.pipe(takeUntil(this.onDestroy$)).subscribe(reset => {
      this.showRotate = false;
      this.showSave = false;
      this.showCancel = false;
      this.animateRotate = '';

      if (this.piece && reset && this.pieceValue !== this.piece.id) {
        if (PieceComponent.getType(this.piece.id) === PieceType.SUN) {
          this.setRotateBackSunAnimation();
        } else {
          this.setRotateBackAnimation();
        }

        this.pieceValue = this.piece.id;
        this.rotation = this.getRotation();
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  private initPiece(pieceNumber: number): void {
    if (this.piece === undefined) {
      this.piece = this.createPiece(pieceNumber);
    } else {

      const newPiece = pieceNumber - (pieceNumber % 100 - pieceNumber % 10);
      const currentPiece = this.piece.id - (this.piece.id % 100 - this.piece.id % 10);

      if (newPiece !== currentPiece) {
        this.piece = this.createPiece(pieceNumber);
      } else {
        this.piece.id = pieceNumber;
        this.pieceValue = pieceNumber;
        this.rotation = this.getRotation();

        if (PieceComponent.getType(this.piece.id) === PieceType.SUN) {
          this.setRotateSunAnimation();
        } else {
          this.setRotateAnimation();
        }
      }
    }
  }

  createPiece(pieceValue: number): Piece {
    this.pieceValue = pieceValue;
    this.rotation = this.getRotation();

    return {
      id: pieceValue,
      x: this.x,
      y: this.y,
      type: PieceComponent.getType(pieceValue)
    };
  }

  public static getType(piece: number): PieceType {
    switch (piece % 10) {
      case 1:
        return PieceType.SUN;
      case 2:
        return PieceType.KING;
      case 3:
        return PieceType.WALL;
      case 4:
        return PieceType.REFLECTOR;
      case 5:
        return PieceType.ANGLER;
      default:
        return PieceType.NONE;
    }
  }

  static getMirrorRotation(pieceValue: number): number {
    if (PieceComponent.getType(pieceValue) === PieceType.KING
      || PieceComponent.getType(pieceValue) === PieceType.REFLECTOR) return pieceValue;

    const rotation = (pieceValue % 100 - pieceValue % 10);

    if (rotation / 10 === 0) {
      pieceValue = pieceValue - rotation + 20;
    } else if (rotation / 10 === 1) {
      pieceValue = pieceValue - rotation + 30;
    } else if (rotation / 10 === 2) {
      pieceValue = pieceValue - rotation;
    } else if (rotation / 10 === 3) {
      pieceValue = pieceValue - rotation + 10;
    }

    return pieceValue;
  }

  private getRotation(): string {
    switch (MoveValidatorService.getRotation(this.pieceValue)) {
      case 0:
        return 'up';
      case 1:
        return 'right';
      case 2:
        return 'down';
      case 3:
        return 'left';
      default:
        return ''
    }
  }

  getPieceImageName(): string {
    if (!this.piece) return '';

    if (this.piece.id >= 100) return GodType.NANAHUATZIN + '_' + this.piece.type.toString() + '.png';
    else return GodType.CAMAXTLI + '_' + this.piece.type.toString() + '.png';
  }

  doOrPrepareMove(): void {
    if (!this.piece) return;

    if (this.playerQuery.isPlaying().bot) return;

    const prepare = this.actionQuery.preparedMove$.value;

    if (!prepare) {
      this.actionService.doOrPrepareMove(this.piece.x, this.piece.y);
      return;
    }

    if (prepare && this.piece.x !== prepare.from.x || this.piece.y !== prepare.from.y) {
      this.actionService.doOrPrepareMove(this.piece.x, this.piece.y);
      return;
    } // else it is a rotating move
  }

  rotatePiece(): void {
    if (!this.piece) return;

    const rotationPositions = MoveValidatorService.getPossibleRotations(this.pieceValue, this.piece.x, this.piece.y);
    const currentRotation = MoveValidatorService.getRotation(this.pieceValue); // 1, 2, 3 or 4

    for (let i = 0; i < rotationPositions.length; i++) {
      const possibleRotation = rotationPositions[i];
      const rotationValue = MoveValidatorService.getRotation(possibleRotation.toPiece);

      if (currentRotation < rotationValue && rotationPositions.length > i) {
        this.pieceValue = rotationPositions[i].toPiece;
        this.rotation = this.getRotation();
        break;
      }

      if (i === rotationPositions.length - 1) {
        this.pieceValue = rotationPositions[0].toPiece;
        this.rotation = this.getRotation();
        break;
      }
    }


    if (this.piece.id !== this.pieceValue) {
      this.showSave = true;
      this.showCancel = true;
      this.actionQuery.possibleWalks$.next(undefined);
    } else {
      this.showSave = false;
      this.showCancel = false;
      this.actionService.doOrPrepareMove(this.piece.x, this.piece.y);
    }

    if (PieceComponent.getType(this.piece.id) === PieceType.SUN) {
      this.setRotateSunAnimation();

    } else {
      this.setRotateAnimation();
    }
  }

  reset(): void {
    if (!this.piece) return;

    this.actionService.doOrPrepareMove(this.piece.x, this.piece.y);
  }

  save(): void {
    if (!this.piece) return;

    this.actionService.saveRotation(this.piece.x, this.piece.y, this.pieceValue);
  }


  private setRotateAnimation(): void {
    this.animateRotate = '';

    switch (this.rotation) {
      case 'up': {
        this.animateRotate = 'animate-rotate-right-up';
        break;
      }
      case 'right': {
        this.animateRotate = 'animate-rotate-right-right';
        break;
      }
      case 'down': {
        this.animateRotate = 'animate-rotate-right-down';
        break;
      }
      case 'left': {
        this.animateRotate = 'animate-rotate-right-left';
        break;
      }
    }
  }

  private setRotateBackAnimation(): void {
    this.animateRotate = '';

    const currentRotation = MoveValidatorService.getRotation(this.pieceValue);
    const originalRotation = MoveValidatorService.getRotation(this.piece?.id!);

    // rotate 180°
    if (Math.abs(currentRotation - originalRotation) === 2 && this.rotation === 'right') {
      this.animateRotate = 'animate-rotate-left-left-right';
      return;
    }
    if (Math.abs(currentRotation - originalRotation) === 2 && this.rotation === 'left') {
      this.animateRotate = 'animate-rotate-right-left-right';
      return;
    }
    if (Math.abs(currentRotation - originalRotation) === 2 && this.rotation === 'up') {
      this.animateRotate = 'animate-rotate-left-up-down';
      return;
    }
    if (Math.abs(currentRotation - originalRotation) === 2 && this.rotation === 'down') {
      this.animateRotate = 'animate-rotate-right-up-down';
      return;
    }

    // rotate 270° -> search the right direction backwards
    if (currentRotation === 0 && originalRotation === 1) {
      this.animateRotate = 'animate-rotate-right-right';
      return;
    }
    if (currentRotation === 1 && originalRotation === 2) {
      this.animateRotate = 'animate-rotate-right-down';
      return;
    }
    if (currentRotation === 3 && originalRotation === 0) {
      this.animateRotate = 'animate-rotate-right-up';
      return;
    }
    if (currentRotation === 2 && originalRotation === 3) {
      this.animateRotate = 'animate-rotate-right-left';
      return;
    }

    // rotate 90° backwards
    switch (this.rotation) {
      case 'up': {
        this.animateRotate = 'animate-rotate-left-up';
        break;
      }
      case 'right': {
        this.animateRotate = 'animate-rotate-left-right';
        break;
      }
      case 'down': {
        this.animateRotate = 'animate-rotate-left-down';
        break;
      }
      case 'left': {
        this.animateRotate = 'animate-rotate-left-left';
        break;
      }
    }
  }

  private setRotateSunAnimation(): void {
    this.animateRotate = '';

    if (this.rotation === 'left') {
      this.animateRotate = 'animate-rotate-left-up';
      return;
    }
    if (this.rotation === 'up') {
      this.animateRotate = 'animate-rotate-right-up';
      return;
    }

    if (this.rotation === 'right') {
      this.animateRotate = 'animate-rotate-left-down';
      return;
    }
    if (this.rotation === 'down') {
      this.animateRotate = 'animate-rotate-right-down';
      return;
    }
  }

  private setRotateBackSunAnimation(): void {
    this.animateRotate = '';

    if (this.rotation === 'left') {
      this.animateRotate = 'animate-rotate-right-up';
    }

    if (this.rotation === 'right') {
      this.animateRotate = 'animate-rotate-right-down';
      return;
    }
  }

  private initMoveAnimation(): void {
    this.actionQuery.selectActive().pipe(takeUntil(this.onDestroy$)).subscribe(action => {
      this.animateMove = undefined;

      if (action?.move) {
        // normal move
        if (action?.move?.to?.x === this.x && action?.move.to.y === this.y) {
          this.setMoveAnimation(action?.move.position, action.move.to);
        }

        // swap
        if (action?.move?.position?.x === this.x && action?.move.position.y === this.y
          && action?.move?.to?.x && action?.move?.to?.y) {
          // was on target even a piece?
          const piece = this.matrixQuery.getLatestMatrixState()[action.move.position.y][action?.move.position.x];
          if (piece !== 0) {
            this.setMoveAnimation(action?.move.to, action.move.position);
          }
        }
      }
    });
  }

  private setMoveAnimation(from: Field, to: Field): void {
    if (to.x - from.x === 0 && to.y - from.y < 0) {
      this.animateMove = 'UP';
    } else if (to.x - from.x > 0 && to.y - from.y < 0) {
      this.animateMove = 'UP-RIGHT';
    } else if (to.x - from.x > 0 && to.y - from.y === 0) {
      this.animateMove = 'RIGHT';
    } else if (to.x - from.x > 0 && to.y - from.y > 0) {
      this.animateMove = 'RIGHT-DOWN';
    } else if (to.x - from.x === 0 && to.y - from.y > 0) {
      this.animateMove = 'DOWN';
    } else if (to.x - from.x < 0 && to.y - from.y > 0) {
      this.animateMove = 'DOWN-LEFT';
    } else if (to.x - from.x < 0 && to.y - from.y === 0) {
      this.animateMove = 'LEFT';
    } else if (to.x - from.x < 0 && to.y - from.y < 0) {
      this.animateMove = 'LEFT-UP';
    }
  }
}


