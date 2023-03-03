import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, guid, StoreConfig } from '@datorama/akita';
import { Matrix } from './matrix.model';
import { GodType } from '../player/player.model';
import { PgnLoaderComponent } from '../../settings/pgn-loader/pgn-loader.component';


export interface MatrixState extends EntityState<Matrix>, ActiveState {
}

export function createInitialState(): MatrixState {
  return {} as MatrixState;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'matrix', resettable: true})
export class MatrixStore extends EntityStore<MatrixState> {

  public static readonly WIDTH_NUMBER = 7;
  public static readonly HEIGHT_NUMBER = 6;
  public static readonly BOARD_SIZE: '10x8' | '7x6' = '7x6';
  public static readonly NORMAL = false;

  public static readonly MAX_ACTION_INDEX = 11;
  public static readonly IMPOSSIBLE_INDEXES = [
    0, 1, 2, 7, 6, 8, 11, 11, 12, 13, 22, 23, 24, 33, 34, 35, 44, 45, 46, 55, 56, 57, 39, 40, 41, 42, 43, 77, 83, 84, 145, 146, 147, 154, 160, 161, 222, 223, 224, 231, 237, 238, 299, 300, 301, 308, 314, 315, 376, 377, 378, 385, 389, 390, 391, 392, 400, 401, 402, 411, 412, 413, 422, 423, 424, 433, 434, 435, 444, 445, 446, 453, 454, 455, 456, 457, 460, 461
  ] // 78 entries
  public static readonly IMPOSSIBLE_INDEX_LENGTH = 78;
  // board size * max action index - impossible index length + 1 => 385, last possible action index is 384, array[384] -> 385 actions
  public static readonly TOTAL_POSSIBLE_ACTIONS = 7 * 6 * 11 - 78 + 1;


  constructor() {
    super(createInitialState());

    this.createMatrix();
  }

  public createMatrix(): void {
    if (MatrixStore.NORMAL) {
      this.createNormalMatrix();
    } else {
      this.createSimpleMatrix();
    }
  }

  public createNormalMatrix(): void {
    // hint -> right-handed coordinate system 1 = 3, 3 = 1 on rotation number
    try {
      const matrix = PgnLoaderComponent.getMatrix(PgnLoaderComponent.defaultPGN10x8);
      if (matrix) this.init(matrix);
      else throw new Error('PGN not valid, load default matrix');
    } catch (e) {
      console.error(e);
      const matrix: number[][] = [
        [121, 0, 0, 0, 123, 102, 123, 115, 0, 0],
        [0, 0, 125, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 35, 0, 0, 0, 0, 0, 0],
        [105, 0, 25, 0, 14, 104, 0, 115, 0, 35],
        [115, 0, 35, 0, 4, 114, 0, 105, 0, 25],
        [0, 0, 0, 0, 0, 0, 115, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 5, 0, 0],
        [0, 0, 35, 3, 2, 3, 0, 0, 0, 1],
      ];

      this.init(matrix);
    }
  }

  private createSimpleMatrix(): void {
    // hint -> right-handed coordinate system 1 = 3, 3 = 1 on rotation number
    try {
      const matrix = PgnLoaderComponent.getMatrix(PgnLoaderComponent.defaultPGN7x6);

      if (matrix) this.init(matrix);
      else throw new Error('PGN not valid, load default matrix');
    } catch (e) {
      console.error(e);

      // 7x6
      const matrix: number[][] = [
        [121, 0, 103, 102, 104, 0, 0],
        [0, 114, 0, 0, 0, 0, 0],
        [0, 0, 35, 0, 105, 0, 25],
        [105, 0, 25, 0, 115, 0, 0],
        [0, 0, 0, 0, 0, 14, 0],
        [0, 0, 4, 2, 3, 0, 1]
      ];

      // //6x5
      // const matrix: number[][] = [
      //   [121, 0, 102, 103, 115, 25],
      //   [0, 114, 0, 0, 0, 0],
      //   [0, 0, 25, 105, 0, 0],
      //   [0, 0, 0, 0, 14, 0],
      //   [105, 35, 3, 2, 0, 1]
      // ];

      // //5x4
      // const matrix: number[][] = [
      //   [121, 0, 102, 104, 25],
      //   [0, 0, 104, 0, 0],
      //   [0, 0, 4, 0, 0],
      //   [105, 4, 2, 0, 1]
      // ];

      this.init(matrix);
    }
  }

  init(matrix: number[][]): void {
    const newID = guid();
    this.upsert(newID, {
      state: matrix,
      pgn: MatrixStore.NORMAL ? PgnLoaderComponent.defaultPGN10x8 : PgnLoaderComponent.defaultPGN7x6
    });
    this.setActive(newID);
  }

  save(matrix: number[][], playing: GodType): void {
    const newID = guid();
    this.upsert(newID, {
      state: matrix,
      pgn: PgnLoaderComponent.getPGN(matrix, playing)
    });
    this.setActive(newID);
  }


  getDefaultMatrix(): number[][] {
    if (MatrixStore.NORMAL) {
      return PgnLoaderComponent.getMatrix(PgnLoaderComponent.defaultPGN10x8)!;
    } else {
      return PgnLoaderComponent.getMatrix(PgnLoaderComponent.defaultPGN7x6)!;
    }
  }
}
