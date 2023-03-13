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

  public static readonly MAX_ACTION_INDEX = 12;
  public static readonly IMPOSSIBLE_INDEXES = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    11,
    12,
    13,
    14,
    24,
    25,
    26,
    36,
    37,
    38,
    48,
    49,
    50,
    60,
    61,
    62,
    72,
    73,
    74,
    75,
    76,
    84,
    90,
    91,
    158,
    159,
    160,
    168,
    174,
    175,
    242,
    243,
    244,
    252,
    258,
    259,
    326,
    327,
    328,
    336,
    342,
    343,
    410,
    411,
    412,
    420,
    424,
    425,
    426,
    427,
    436,
    437,
    438,
    448,
    449,
    450,
    460,
    461,
    462,
    472,
    473,
    474,
    484,
    485,
    486,
    492,
    493,
    494,
    495,
    496,
    497,
    498,
    499,
    501,
    502
  ] // 84 entries
  public static readonly IMPOSSIBLE_INDEX_LENGTH = 84;
  public static readonly TOTAL_POSSIBLE_ACTIONS = 7 * 6 * 12 - 84;


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
