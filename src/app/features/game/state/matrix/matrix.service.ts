import { Injectable } from '@angular/core';
import { MatrixStore } from './matrix.store';
import { MatrixQuery } from './matrix.query';
import { guid } from '@datorama/akita';
import { GodType } from '../player/player.model';
import { Move, MoveType, Rotation, Walk } from '../action/move.model';
import { environment } from '../../../../../environments/environment';
import { Destroy } from '../../light/light.model';
import { PgnLoaderComponent } from '../../settings/pgn-loader/pgn-loader.component';
import { PieceComponent } from '../../board/piece/piece.component';


@Injectable({providedIn: 'root'})
export class MatrixService {

  constructor(
    private matrixStore: MatrixStore,
    private matrixQuery: MatrixQuery,
  ) {
  }

  static copy(matrix: number[][]): number[][] {
    return structuredClone(matrix);
    // const len = matrix.length, copiedMatrix = new Array(len);
    // for (let i = 0; i < len; ++i) copiedMatrix[i] = matrix[i].slice(0);
    //
    // return copiedMatrix;
  }

  updateMoveOnMatrix(move: Move, playing: GodType): void {
    if (move.type === MoveType.WALK) {
      this.updateWalkOnMatrix(move as Walk, playing);
    }

    if (move.type === MoveType.ROTATE) {
      this.updateRotateOnMatrix(move as Rotation, playing);
    }
  }

  private updateWalkOnMatrix(walk: Walk, playing: GodType): void {
    this.matrixStore.setLoading(true);

    const matrix = MatrixService.copy(this.matrixQuery.getLatestMatrixState());

    const oldY = walk.position.y, oldX = walk.position.x;
    const newY = walk.to.y, newX = walk.to.x;

    const from = matrix[oldY][oldX];
    const to = matrix[newY][newX];

    matrix[newY][newX] = from;
    matrix[oldY][oldX] = to;

    this.matrixStore.save(matrix, playing);

    if (environment.log) console.log('updateWalkOnMatrix:', this.matrixQuery.getAll());

    this.matrixStore.setLoading(false);
  }

  private updateRotateOnMatrix(rotate: Rotation, playing: GodType) {
    this.matrixStore.setLoading(true);

    const matrix = MatrixService.copy(this.matrixQuery.getLatestMatrixState());
    matrix[rotate.position.y][rotate.position.x] = rotate.toPiece;

    this.matrixStore.save(matrix, playing);

    if (environment.log) console.log('updateRotateOnMatrix:', this.matrixQuery.getAll());

    this.matrixStore.setLoading(false);
  }

  updateDestroyOnMatrix(destroy: Destroy, playing: GodType) {
    this.matrixStore.setLoading(true);

    const matrix = MatrixService.copy(this.matrixQuery.getLatestMatrixState());
    matrix[destroy.position.y][destroy.position.x] = 0;

    // Update last state because of destroyed piece need to be in sync with actions state
    this.matrixStore.update(
      this.matrixQuery.getLatestMatrix().id,
      {
        state: matrix,
        pgn: PgnLoaderComponent.getPGN(matrix, playing)
      }
    );

    if (environment.log) console.log('updateDestroyOnMatrix:', this.matrixQuery.getAll());

    this.matrixStore.setLoading(false);
  }

  reset(): void {
    this.matrixStore.reset();
    this.matrixStore.createMatrix();
  }

  loadMatrixFromPGN(matrix: number[][], notation: string): void {
    const newID = guid();
    this.matrixStore.upsert(newID, {
      state: matrix,
      pgn: notation
    });
    this.matrixStore.setActive(newID);

    if (environment.log) console.log('loadMatrixFromPGN matrix:', this.matrixQuery.getAll());
  }

  setActiveMatrix(id: string): void {
    this.matrixStore.setActive(id);

    if (environment.log) console.log('setActiveMatrix:', this.matrixQuery.getAll());
  }

  swapStates(): void {
    const all = this.matrixQuery.getAll();

    const swapped = all.map(matrix => {
      const swappedMatrix = MatrixService.swapMatrix(matrix.state);
      const played = PgnLoaderComponent.getPlaying(matrix.pgn) === GodType.CAMAXTLI ? GodType.NANAHUATZIN : GodType.CAMAXTLI;
      return {
        ...matrix,
        state: swappedMatrix,
        pgn: PgnLoaderComponent.getPGN(swappedMatrix, played)
      }
    });

    this.matrixStore.upsertMany(swapped);
  }

  public static swapMatrix(state: number[][]): number[][] {
    const copy = MatrixService.copy(state);

    for (let y = 0; y < state.length; y++) {

      for (let x = 0; x < state[y].length; x++) {
        let currentPointValue = state[y][x];
        if (currentPointValue !== 0) {
          currentPointValue = PieceComponent.getMirrorRotation(currentPointValue);

          copy[state.length - y - 1][state[y].length - x - 1] = currentPointValue;
        } else {
          copy[state.length - y - 1][state[y].length - x - 1] = 0;
        }

        let mirrorPointValue = state[state.length - y - 1][state[y].length - x - 1]
        if (mirrorPointValue !== 0) {
          mirrorPointValue = PieceComponent.getMirrorRotation(mirrorPointValue);

          copy[y][x] = mirrorPointValue;
        } else {
          copy[y][x] = 0;
        }

      }
    }

    return copy;
  }


}
