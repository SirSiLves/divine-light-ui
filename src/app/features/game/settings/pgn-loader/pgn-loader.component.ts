import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatrixQuery } from '../../state/matrix/matrix.query';
import { GodType } from '../../state/player/player.model';
import { PieceType } from '../../board/piece/piece';
import { PieceComponent } from '../../board/piece/piece.component';
import { Action } from '../../state/action/action.model';
import { Move, MoveType } from '../../state/action/move.model';
import { MoveValidatorService } from '../../validator/move-validator.service';
import { MatrixStore } from '../../state/matrix/matrix.store';

@Component({
  selector: 'app-pgn-loader',
  templateUrl: './pgn-loader.component.html',
  styleUrls: ['./pgn-loader.component.scss']
})
export class PgnLoaderComponent implements OnInit, OnDestroy {

  // PGN - Portable Game Notation
  // https://de.wikipedia.org/wiki/Forsyth-Edwards-Notation
  // Pieces: SUN: S or s, KING: K or k, WALL: W or w, REFLECTOR: R or r, ANGLER: A or a
  // Rotation: 0 = u, 1 = r, 2 = d or 3 = l
  // Empty fields with: 1-9
  // Next Player: -c, -n
  public static readonly defaultPGN10x8: string = 's23w2k0w2a12/2a27/3A36/a01A21R1r01a11A3/a11A31R0r11a01A2/6a13/7A02/2A3W0K0W03S0-c';
  public static readonly defaultPGN7x6: string = 's21w0k0r02/1r15/2A31a01A2/a01A21a12/5R11/2R0K0W01S0-c'; // 7x6
  public static readonly defaultPGN5x4: string = 's21k0r0R1/2a12/2A32/r1R0K01S0-c'; // 1 anglers and 2 reflectors

  private onDestroy$ = new Subject<void>();

  @Input() set notation(value: string | undefined) {
    this.pgn.patchValue(value);
    this.pgn.disable();
  }

  @Output() notationChange$ = new EventEmitter<string>();
  @Output() matrix$ = new BehaviorSubject<number[][] | undefined>(undefined);

  formGroup: FormGroup = this.formBuilder.group({
    pgn: []
  });

  edit = false;
  copy = false;

  constructor(
    private matrixQuery: MatrixQuery,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.pgn.valueChanges.pipe(
      takeUntil(this.onDestroy$),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.pgn.value) {
        const matrix = PgnLoaderComponent.getMatrix(this.pgn.value);
        this.matrix$.next(matrix);
        this.notationChange$.next(this.pgn.value);

        if (!matrix) this.pgn.setErrors({'invalid': true});
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public static getPGN(matrix: number[][], played: GodType): string {
    let pgn = '';

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const fieldValue = matrix[y][x];

        if (PieceComponent.getType(fieldValue) === PieceType.NONE) {
          // count empty fields
          let i = 0;
          while (i < matrix[y].length - x) {
            const optEmptyFieldValue = matrix[y][x + i];
            if (PieceComponent.getType(optEmptyFieldValue) !== PieceType.NONE) {
              break;
            }
            i++; // are there more empty fields
          }

          pgn = pgn + i;
          x = x + (i - 1);
        } else {
          pgn = PgnLoaderComponent.getPiecePGNValueWithRotation(pgn, fieldValue)
        }
      }

      // new row
      if (y < matrix.length - 1) pgn = pgn + '/';
    }

    // set played - opposite
    pgn = played === GodType.CAMAXTLI ? pgn + '-n' : pgn + '-c';

    return pgn;
  }


  public static getMatrix(pgn: string | undefined): number[][] | undefined {
    if (!pgn) return undefined;

    let matrix: number[][] = [[]];
    let row = 0;

    for (let i = 0; i < pgn.length; i++) {
      let char = pgn.charAt(i);

      // position declaration ended
      if (char === '-') {
        break;
      }

      // new row
      else if (char === '/') {
        matrix.push([]);
        row++;
      }

      // empty space
      else if (char.match('[0-9]')) {
        let number = Number(char);
        // it can be more than 0,9
        if (i < pgn.length - 1) {
          let tempChar = pgn.charAt(i + 1);
          if (tempChar.match('[0-9]')) {
            number = Number(char + tempChar);
          }
        }

        this.setEmpty(matrix, number, row);
      }

      // is it a piece
      else if (['s', 'k', 'w', 'r', 'a'].includes(char.toLowerCase())) {
        this.setPiece(matrix, pgn, i, char, row);
        i = i + 1; // increase because of rotation value
      }
    }

    if (!this.validateMatrix(matrix)) return undefined;

    return matrix;
  }

  private static setPiece(matrix: number[][], pgn: string, i: number, char: string, row: number) {
    const rotation = Number(pgn.charAt(i + 1)) * 10;

    if (char === 's') {
      matrix[row].push(100 + rotation + 1);
    } else if (char === 'S') {
      matrix[row].push(rotation + 1);
    } else if (char === 'k') {
      matrix[row].push(100 + rotation + 2);
    } else if (char === 'K') {
      matrix[row].push(rotation + 2);
    } else if (char === 'w') {
      matrix[row].push(100 + rotation + 3);
    } else if (char === 'W') {
      matrix[row].push(rotation + 3);
    } else if (char === 'r') {
      matrix[row].push(100 + rotation + 4);
    } else if (char === 'R') {
      matrix[row].push(rotation + 4);
    } else if (char === 'a') {
      matrix[row].push(100 + rotation + 5);
    } else if (char === 'A') {
      matrix[row].push(rotation + 5);
    }
  }

  private static setEmpty(matrix: number[][], number: number, row: number): void {
    for (let i = 0; i < number; i++) {
      matrix[row].push(0);
    }
  }

  private static validateMatrix(matrix: number[][]): boolean {
    for (let y = 0; y < matrix.length; y++) {
      if (matrix[y].length !== MatrixStore.WIDTH_NUMBER) {
        return false;
      }
    }

    // s23k0a12/2A3w22a11/a0A22R12A3/a1A32r11a0A2/8/2A3K0W0a11S0-c

    return matrix.length === MatrixStore.HEIGHT_NUMBER;
  }

  enableEdit(): void {
    this.edit = true;
    this.pgn.enable();
    this.pgn.patchValue('');
  }

  copyPGN(): void {
    this.copy = true;
    setTimeout(() => {
      this.copy = false;
    }, 200);
  }

  private static getPiecePGNValueWithRotation(pgn: string, pieceValue: number): string {
    const rotation = MoveValidatorService.getRotation(pieceValue);
    return PgnLoaderComponent.getPiecePGNValue(pgn, pieceValue) + rotation;
  }

  private static getPiecePGNValue(pgn: string, pieceValue: number): string {
    if (PieceComponent.getType(pieceValue) === PieceType.SUN) {
      pgn = pieceValue < 100 ? pgn + 'S' : pgn + 's';
    } else if (PieceComponent.getType(pieceValue) === PieceType.KING) {
      pgn = pieceValue < 100 ? pgn + 'K' : pgn + 'k';
    } else if (PieceComponent.getType(pieceValue) === PieceType.WALL) {
      pgn = pieceValue < 100 ? pgn + 'W' : pgn + 'w';
    } else if (PieceComponent.getType(pieceValue) === PieceType.REFLECTOR) {
      pgn = pieceValue < 100 ? pgn + 'R' : pgn + 'r';
    } else if (PieceComponent.getType(pieceValue) === PieceType.ANGLER) {
      pgn = pieceValue < 100 ? pgn + 'A' : pgn + 'a';
    }

    return pgn;
  }

  public static getPlaying(notation: string): GodType {
    for (let i = 0; i < notation.length; i++) {
      let char = notation.charAt(i);
      const god = notation.charAt(i + 1);
      if (char === '-' && (god === 'c' || god === 'n')) {
        if (god === 'c') return GodType.CAMAXTLI;
        if (god === 'n') return GodType.NANAHUATZIN;
      }
    }

    return GodType.CAMAXTLI;
  }

  get pgn(): FormControl {
    return this.formGroup?.controls['pgn'] as FormControl;
  }

  static getActionToPGN(action: Action, godType: GodType): string {
    let pgn = '';

    if (action.move) {
      pgn = pgn + PgnLoaderComponent.getPiecePGNValueWithRotation('', action.move.piece);

      // current position
      pgn = pgn + PgnLoaderComponent.getXAxisValue(action.move.position.x, godType) +
        PgnLoaderComponent.getYAxisValue(action.move.position.y, godType);

      if (action.move.type === MoveType.WALK && action.move.to) {
        pgn = pgn + PgnLoaderComponent.getXAxisValue(action.move.to.x, godType) +
          PgnLoaderComponent.getYAxisValue(action.move.to.y, godType);
      }

      if (action.move.type === MoveType.ROTATE && action.move.toPiece) {
        pgn = pgn + PgnLoaderComponent.getPiecePGNValueWithRotation('', action.move.toPiece);
      }
    }

    return pgn;
  }

  static getMoveToPGN(move: Move, godType: GodType): string {
    let pgn = '';

    pgn = pgn + PgnLoaderComponent.getPiecePGNValueWithRotation('', move.piece);

    // current position
    pgn = pgn + PgnLoaderComponent.getXAxisValue(move.position.x, godType) +
      PgnLoaderComponent.getYAxisValue(move.position.y, godType);

    if (move.type === MoveType.WALK && move.to) {
      pgn = pgn + PgnLoaderComponent.getXAxisValue(move.to.x, godType) +
        PgnLoaderComponent.getYAxisValue(move.to.y, godType);
    }

    if (move.type === MoveType.ROTATE && move.toPiece) {
      pgn = pgn + PgnLoaderComponent.getPiecePGNValueWithRotation('', move.toPiece);
    }

    return pgn;
  }

  static getXAxisValue(x: number, godType: GodType): string {
    if (godType === GodType.CAMAXTLI) {
      return 'abcdefg'.charAt(x);
    } else {
      return 'gfedcba'.charAt(x);
    }
  }

  static getYAxisValue(y: number, godType: GodType): string {
    if (godType === GodType.NANAHUATZIN) {
      return '654321'.charAt(y);
    } else {
      return '123456'.charAt(y);
    }
  }
}
