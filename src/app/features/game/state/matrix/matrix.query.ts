import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MatrixStore, MatrixState } from './matrix.store';
import { Matrix } from './matrix.model';

@Injectable({providedIn: 'root'})
export class MatrixQuery extends QueryEntity<MatrixState> {

  matrixActive$ = this.selectActive(store => store?.state);
  pgnActive$ = this.selectActive(store => store?.pgn);

  constructor(protected override store: MatrixStore) {
    super(store);
  }

  getActiveMatrixState(): number[][] {
    return this.getActive()!.state;
  }

  getLatestMatrixState(): number[][] {
    return this.getLatestMatrix()!.state;
  }

  getLatestMatrix(): Matrix {
    const all = this.getAll();
    return all[all.length - 1]!;
  }


  getActiveMatrix(): Matrix {
    return this.getActive()!;
  }

  static getCellID(x: number, y: number): number {
    const xPosition = x
    const yPosition = y * MatrixStore.WIDTH_NUMBER;

    return xPosition + yPosition + 1;
  }

  static getPieceNumber(matrix: number[][], x: number, y: number): number {
    return matrix[y][x]
  }


  getDefaultMatrix(): number[][] {
    return this.store.getDefaultMatrix();
  }

  static isSwappedMatrixPosition(matrix: number[][]): boolean {
    return matrix[0][0] < 100;
  }

}
