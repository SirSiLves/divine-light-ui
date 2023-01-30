import { Injectable } from '@angular/core';
import { ActionStore } from './action.store';
import { MatrixService } from '../matrix/matrix.service';
import { MatrixQuery } from '../matrix/matrix.query';
import { ActionQuery } from './action.query';
import { PlayerService } from '../player/player.service';
import { PlayerQuery } from '../player/player.query';
import { take } from 'rxjs';
import { Move, MoveType, Rotation, Walk } from './move.model';
import { Field } from './field.model';
import { PieceComponent } from '../../board/piece/piece.component';
import { Destroy } from '../../light/light.model';
import { LightService } from '../../light/light.service';
import { MoveValidatorService } from '../../validator/move-validator.service';
import { MatrixStore } from '../matrix/matrix.store';

@Injectable({providedIn: 'root'})
export class ActionService {


  constructor(
    private playerService: PlayerService,
    private playerQuery: PlayerQuery,
    private actionStore: ActionStore,
    private actionQuery: ActionQuery,
    private matrixService: MatrixService,
    private matrixQuery: MatrixQuery,
    private lightService: LightService
  ) {
  }

  doOrPrepareMove(x: number, y: number): void {
    if (this.actionQuery.isHistory$.value) {
      this.actionQuery.isHistory$.next(false);
      return;
    }

    if (!this.lightService.lightOff$.value || this.playerQuery.winner$.value != undefined || this.playerQuery.draw$.value) {
      return;
    }

    // first click on piece
    if (this.actionQuery.preparedMove$.getValue() === undefined) {

      const matrix = this.matrixQuery.getLatestMatrixState();
      const piece = MatrixQuery.getPieceNumber(matrix, x, y);

      if (this.playerQuery.isAllowTopPlay(piece)) {
        this.setPrepareMove(matrix, piece, x, y);
      }

      return;
    }

    // second click on a piece or field
    if (this.actionQuery.preparedMove$.value !== undefined) {
      const possibleWalk: Walk | undefined = this.actionQuery.possibleWalks$.getValue()?.find(w => w.to.x === x && w.to.y === y);
      if (possibleWalk) {

        // execute move
        this.actionQuery.lastMove$.next(possibleWalk);
        this.playerService.switchPlayer(possibleWalk);

        this.resetPreparedMove();
      } else {
        this.resetPreparedMove();

        const matrix = this.matrixQuery.getLatestMatrixState();
        const piece = MatrixQuery.getPieceNumber(matrix, x, y);

        if (this.playerQuery.isAllowTopPlay(piece)) {
          this.setPrepareMove(matrix, piece, x, y);
        }
      }

      return;
    }
  }

  setPrepareMove(matrix: number[][], piece: number, x: number, y: number): void {
    // no piece was clicked
    if (piece === 0) return;

    // piece successfully clicked
    this.actionQuery.preparedMove$.next({from: {x, y}, piece});
    this.setPossibleMoves(matrix, piece, {x: x, y: y})
  }

  saveRotation(x: number, y: number, piece: number): void {
    const possibleRotation: Rotation | undefined = this.actionQuery.possibleRotations$.getValue()?.find(r => r.toPiece === piece);

    if (possibleRotation && this.actionQuery.preparedMove$.value) {

      // execute move
      this.actionQuery.lastMove$.next(possibleRotation);
      this.playerService.switchPlayer(possibleRotation);

      this.resetPreparedMove();
    } else {
      this.resetPreparedMove();
    }
  }

  private setPossibleMoves(matrix: number[][], piece: number, fromField: Field): void {
    const walkFields: Walk[] = MoveValidatorService.getPossibleFields(piece, fromField.x, fromField.y, matrix);
    const rotationPositions: Rotation[] = MoveValidatorService.getPossibleRotations(piece, fromField.x, fromField.y);

    this.actionQuery.possibleWalks$.next(walkFields);
    this.actionQuery.possibleRotations$.next(rotationPositions);
  }


  resetPreparedMove(): void {
    this.actionQuery.reset$.next(true);
    this.actionQuery.possibleWalks$.next(undefined);
    this.actionQuery.possibleRotations$.next(undefined);
    this.actionQuery.preparedMove$.next(undefined);
  }

  reset(): void {
    this.actionStore.reset();
    this.resetPreparedMove();
    this.actionQuery.isHistory$.next(false);
  }

  loadHistory(id: string): void {
    this.actionQuery.isHistory$.next(true);
    this.resetPreparedMove();

    const action = this.actionQuery.getAll().find(a => a.id === id);

    this.matrixService.setActiveMatrix(action!.matrix.id);
    this.actionStore.setActive(action!.id);
  }

  loadLast(): void {
    this.actionQuery.selectLast().pipe(
      take(1)
    ).subscribe(lastAction => {
      if (lastAction) {
        this.actionStore.setActive(lastAction.id);
        this.matrixService.setActiveMatrix(lastAction.matrix.id);
      }
    });
  }

  swapActions(): void {
    const all = this.actionQuery.getAll();

    const swappedActions = all.map(a => {
      return {
        ...a,
        move: ActionService.swapMove(a.move),
        destroy: ActionService.swapDestroy(a.destroy)
      }
    });

    this.actionStore.upsertMany(swappedActions)
  }

  public static swapMove(move: Move | undefined): Move | undefined {
    if (!move) return undefined
    let mirrorMove = {
      ...move,
      piece: PieceComponent.getMirrorRotation(move.piece)
    };

    mirrorMove.position = {
      x: (MatrixStore.WIDTH_NUMBER - 1) - move.position.x,
      y: (MatrixStore.HEIGHT_NUMBER - 1) - move.position.y
    };

    if (move.type === MoveType.WALK && move.to) {
      mirrorMove.to = {
        x: (MatrixStore.WIDTH_NUMBER - 1) - move.to.x,
        y: (MatrixStore.HEIGHT_NUMBER - 1) - move.to.y
      }
    }

    if (move.type === MoveType.ROTATE && move.toPiece) {
      mirrorMove.toPiece = PieceComponent.getMirrorRotation(move.toPiece);
    }

    return mirrorMove;
  }

  public static swapDestroy(destroy: Destroy | undefined): Destroy | undefined {
    if (!destroy) return undefined;

    return {
      ...destroy,
      piece: PieceComponent.getMirrorRotation(destroy.piece),
      position: {
        x: (MatrixStore.WIDTH_NUMBER - 1) - destroy.position.x,
        y: (MatrixStore.HEIGHT_NUMBER - 1) - destroy.position.y
      }
    }

  }
}
