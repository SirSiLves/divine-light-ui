import { Injectable } from '@angular/core';
import { PieceType } from 'src/app/features/game/board/piece/piece';
import { PieceComponent } from 'src/app/features/game/board/piece/piece.component';
import { GodType } from 'src/app/features/game/state/player/player.model';
import { MoveType, Rotation, Walk } from '../state/action/move.model';
import { Field } from '../state/action/field.model';
import { MatrixStore } from '../state/matrix/matrix.store';

@Injectable({
  providedIn: 'root'
})
export class MoveValidatorService {


  constructor() {
  }

  static getRotation(piece: number): number {
    // 0 = 0°, 1 = 90°, 2 = 180°, 3 = 270°
    return (piece % 100 - piece % 10) / 10; // (21 - 1) / 10 = 2
  }

  static getPossibleFields(piece: number, x: number, y: number, matrix: number[][]): Walk[] {
    const pieceType: PieceType = PieceComponent.getType(piece);
    const playerType: GodType = piece < 100 ? GodType.CAMAXTLI : GodType.NANAHUATZIN;

    switch (pieceType) {
      case PieceType.SUN:
        return this.possibleSUNFields();
      case PieceType.KING:
        return this.possibleDEFAULTFields(x, y, matrix, playerType, piece);
      case PieceType.WALL:
        return this.possibleDEFAULTFields(x, y, matrix, playerType, piece);
      case PieceType.REFLECTOR:
        return this.possibleREFLECTORFields(x, y, matrix, playerType, piece);
      case PieceType.ANGLER:
        return this.possibleDEFAULTFields(x, y, matrix, playerType, piece);
      default:
        throw new Error('Possible Fields could not be found for piece type: ' + piece);
    }
  }

  static getPossibleRotations(piece: number, x: number, y: number): Rotation[] {
    const pieceType: PieceType = PieceComponent.getType(piece);

    switch (pieceType) {
      case PieceType.SUN:
        return this.possibleSUNRotations(piece, x, y);
      case PieceType.KING:
        return this.possibleKINGRotations();
      case PieceType.WALL:
        return this.possibleWALLRotations();
      case PieceType.REFLECTOR:
        return this.possibleREFLECTORRotations(piece, x, y);
      case PieceType.ANGLER:
        return this.possibleDEFAULTRotations(piece, x, y);
      default:
        return [];
    }
  }

  private static possibleSUNRotations(piece: number, x: number, y: number): Rotation[] {
    // sun can not rotation in all directions
    // 1, 31 | 121, 111
    const pieceTypeInNumber = piece % 10;
    const rotations: Rotation[] = [];
    const currentRotation = this.getRotation(piece);
    const player = piece >= 100 ? 100 : 0;
    const isSwappedPosition = (piece < 100 && x === 0 && y === 0) || (piece >= 100 && x === MatrixStore.WIDTH_NUMBER - 1 && y === MatrixStore.HEIGHT_NUMBER - 1);

    // UP
    if (currentRotation !== 0 && ((player < 100 && !isSwappedPosition) || (player >= 100 && isSwappedPosition))) {
      rotations.push({type: MoveType.ROTATE, position: {x: x, y: y}, piece, toPiece: pieceTypeInNumber + player});
    }

    // RIGHT
    if (currentRotation !== 1 && ((player >= 100 && !isSwappedPosition) || (player < 100 && isSwappedPosition))) {
      rotations.push({type: MoveType.ROTATE, position: {x: x, y: y}, piece, toPiece: pieceTypeInNumber + 10 + player});
    }

    // DOWN
    if (currentRotation !== 2 && ((player >= 100 && !isSwappedPosition) || (player < 100 && isSwappedPosition))) {
      rotations.push({type: MoveType.ROTATE, position: {x: x, y: y}, piece, toPiece: pieceTypeInNumber + 20 + player});
    }

    // LEFT
    if (currentRotation !== 3 && ((player < 100 && !isSwappedPosition) || (player >= 100 && isSwappedPosition))) {
      rotations.push({type: MoveType.ROTATE, position: {x: x, y: y}, piece, toPiece: pieceTypeInNumber + 30 + player});
    }

    return rotations;
  }

  private static possibleKINGRotations(): Rotation[] {
    // king can not rotate
    return [];
  }

  private static possibleWALLRotations() {
    // wall can not rotate
    return [];
  }

  private static possibleREFLECTORRotations(piece: number, x: number, y: number): Rotation[] {
    const rotations = [];

    // reflector can have only 2 directions
    // 04, 14 | 104, 114
    const pieceTypeInNumber = piece % 10;
    const currentRotation = this.getRotation(piece);
    const player = piece >= 100 ? 100 : 0;

    // UP
    if (currentRotation !== 0) {
      rotations.push({type: MoveType.ROTATE, position: {x: x, y: y}, piece, toPiece: pieceTypeInNumber + player});
    }

    // RIGHT
    if (currentRotation !== 1) {
      rotations.push({type: MoveType.ROTATE, position: {x: x, y: y}, piece, toPiece: pieceTypeInNumber + 10 + player});
    }

    return rotations;
  }

  private static possibleDEFAULTRotations(piece: number, x: number, y: number): Rotation[] {
    const rotations = [];

    // wall can rotate in all directions
    // 03, 13, 23, 33 | 103, 113, 123, 133
    const pieceTypeInNumber = piece % 10;
    const currentRotation = this.getRotation(piece);
    const player = piece >= 100 ? 100 : 0;

    // UP
    if (currentRotation !== 0) {
      rotations.push({type: MoveType.ROTATE, position: {x: x, y: y}, piece, toPiece: pieceTypeInNumber + player});
    }

    // RIGHT
    if (currentRotation !== 1) {
      rotations.push({type: MoveType.ROTATE, position: {x: x, y: y}, piece, toPiece: pieceTypeInNumber + 10 + player});
    }

    // DOWN
    if (currentRotation !== 2) {
      rotations.push({type: MoveType.ROTATE, position: {x: x, y: y}, piece, toPiece: pieceTypeInNumber + 20 + player});
    }

    // LEFT
    if (currentRotation !== 3) {
      rotations.push({type: MoveType.ROTATE, position: {x: x, y: y}, piece, toPiece: pieceTypeInNumber + 30 + player});
    }

    return rotations;
  }

  private static possibleSUNFields(): Walk[] {
    // sun is not allowed to walk
    return [];
  }

  private static possibleDEFAULTFields(x: number, y: number, matrix: number[][], playerType: GodType, piece: number): Walk[] {
    const walks: Walk[] = [];
    const fromField: Field = {x, y};

    const upField = this.getUPField(x, y);
    if (upField && matrix[upField.y][upField.x] === 0 && this.validateSaveZone(matrix, playerType, upField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: upField});
    }

    const upRightField = this.getUPRIGHTField(x, y, matrix);
    if (upRightField && matrix[upRightField.y][upRightField.x] === 0 && this.validateSaveZone(matrix, playerType, upRightField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: upRightField});
    }

    const rightField = this.getRIGHTField(x, y, matrix);
    if (rightField && matrix[rightField.y][rightField.x] === 0 && this.validateSaveZone(matrix, playerType, rightField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: rightField});
    }

    const rightDownField = this.getRIGHTDOWNField(x, y, matrix);
    if (rightDownField && matrix[rightDownField.y][rightDownField.x] === 0 && this.validateSaveZone(matrix, playerType, rightDownField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: rightDownField});
    }

    const downField = this.getDOWNField(x, y, matrix);
    if (downField && matrix[downField.y][downField.x] === 0 && this.validateSaveZone(matrix, playerType, downField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: downField});
    }

    const downLeftField = this.getDOWNLEFTField(x, y, matrix);
    if (downLeftField && matrix[downLeftField.y][downLeftField.x] === 0 && this.validateSaveZone(matrix, playerType, downLeftField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: downLeftField});
    }

    const leftField = this.getLEFTField(x, y);
    if (leftField && matrix[leftField.y][leftField.x] === 0 && this.validateSaveZone(matrix, playerType, leftField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: leftField});
    }

    const leftUpField = this.getLEFTUPField(x, y);
    if (leftUpField && matrix[leftUpField.y][leftUpField.x] === 0 && this.validateSaveZone(matrix, playerType, leftUpField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: leftUpField});
    }

    return walks;
  }

  private static possibleREFLECTORFields(x: number, y: number, matrix: number[][], playerType: GodType, piece: number): Walk[] {
    // reflector is allowed on a position with another piece except sun
    const walks: Walk[] = [];
    const allowedPieces = [0, 3, 5]; // none, wall or winkler
    const fromField: Field = {x, y};

    const upField = this.getUPField(x, y);
    if (upField && allowedPieces.includes(matrix[upField.y][upField.x] % 10) && this.validateSaveZone(matrix, playerType, upField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: upField});
    }

    const upRightField = this.getUPRIGHTField(x, y, matrix);
    if (upRightField && allowedPieces.includes(matrix[upRightField.y][upRightField.x] % 10) && this.validateSaveZone(matrix, playerType, upRightField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: upRightField});
    }

    const rightField = this.getRIGHTField(x, y, matrix);
    if (rightField && allowedPieces.includes(matrix[rightField.y][rightField.x] % 10) && this.validateSaveZone(matrix, playerType, rightField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: rightField});
    }

    const rightDownField = this.getRIGHTDOWNField(x, y, matrix);
    if (rightDownField && allowedPieces.includes(matrix[rightDownField.y][rightDownField.x] % 10) && this.validateSaveZone(matrix, playerType, rightDownField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: rightDownField});
    }

    const downField = this.getDOWNField(x, y, matrix);
    if (downField && allowedPieces.includes(matrix[downField.y][downField.x] % 10) && this.validateSaveZone(matrix, playerType, downField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: downField});
    }

    const downLeftField = this.getDOWNLEFTField(x, y, matrix);
    if (downLeftField && allowedPieces.includes(matrix[downLeftField.y][downLeftField.x] % 10) && this.validateSaveZone(matrix, playerType, downLeftField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: downLeftField});
    }

    const leftField = this.getLEFTField(x, y);
    if (leftField && allowedPieces.includes(matrix[leftField.y][leftField.x] % 10) && this.validateSaveZone(matrix, playerType, leftField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: leftField});
    }

    const leftUpField = this.getLEFTUPField(x, y);
    if (leftUpField && allowedPieces.includes(matrix[leftUpField.y][leftUpField.x] % 10) && this.validateSaveZone(matrix, playerType, leftUpField, fromField)) {
      walks.push({type: MoveType.WALK, position: {x, y}, piece, to: leftUpField});
    }

    return walks;
  }

  public static getUPField(x: number, y: number): Field | undefined {
    // UP -> y: - 1, x: 0
    return y > 0 ? {x: x, y: y - 1} : undefined;
  }

  public static getUPRIGHTField(x: number, y: number, matrix: number[][]): Field | undefined {
    // UP/RIGHT -> y: - 1, x: + 1
    return y > 0 && x < matrix[y].length - 1 ? {x: x + 1, y: y - 1} : undefined;
  }

  public static getRIGHTField(x: number, y: number, matrix: number[][]): Field | undefined {
    // RIGHT -> y: 0, x + 1
    return x < matrix[y].length - 1 ? {x: x + 1, y: y} : undefined;
  }

  public static getRIGHTDOWNField(x: number, y: number, matrix: number[][]): Field | undefined {
    // RIGHT/DOWN -> y: + 1, x + 1
    return x < matrix[y].length - 1 && y < matrix.length - 1 ? {x: x + 1, y: y + 1} : undefined;
  }

  public static getDOWNField(x: number, y: number, matrix: number[][]): Field | undefined {
    // DOWN -> y: + 1, x: 0
    return y < matrix.length - 1 ? {x: x, y: y + 1} : undefined;
  }

  public static getDOWNLEFTField(x: number, y: number, matrix: number[][]): Field | undefined {
    // DOWN/LEFT -> y: + 1, x: - 1
    return y < matrix.length - 1 && x > 0 ? {x: x - 1, y: y + 1} : undefined;
  }

  public static getLEFTField(x: number, y: number): Field | undefined {
    // LEFT -> y: 0, x: - 1
    return x > 0 ? {x: x - 1, y: y} : undefined;
  }

  public static getLEFTUPField(x: number, y: number): Field | undefined {
    // LEFT/UP -> y: - 1, x: - 1
    return x > 0 && y > 0 ? {x: x - 1, y: y - 1} : undefined;
  }


  private static validateSaveZone(matrix: number[][], playerType: GodType, targetField: Field, fromField: Field): boolean {
    const possiblePiece = matrix[targetField.y][targetField.x];

    const isSwappedPosition = matrix[0][0] < 100;

    // Switched Piece is afterwards on a SaveZone
    if (this.isOnSaveZoneLEFT(fromField.x, fromField.y, matrix) && possiblePiece >= 100 && possiblePiece !== 0) {
      return false;
    }

    // Switched Piece is afterwards on a SaveZone
    if (this.isOnSaveZoneRIGHT(fromField.x, fromField.y, matrix) && possiblePiece < 100 && possiblePiece !== 0) {
      return false;
    }

    // TargetField is on SaveZone
    if (this.isOnSaveZoneLEFT(targetField.x, targetField.y, matrix)) {
      return isSwappedPosition ? playerType === GodType.NANAHUATZIN : playerType === GodType.CAMAXTLI;
    }

    // TargetField is on SaveZone
    if (this.isOnSaveZoneRIGHT(targetField.x, targetField.y, matrix)) {
      return isSwappedPosition ? playerType === GodType.CAMAXTLI : playerType === GodType.NANAHUATZIN;
    }

    return true;
  }

  private static isOnSaveZoneLEFT(x: number, y: number, matrix: number[][]): boolean {
    return x === matrix[0].length - 1
      || (x === 1 && y === matrix.length - 1)
      || (x === 1 && y === 0)
  }

  private static isOnSaveZoneRIGHT(x: number, y: number, matrix: number[][]): boolean {
    return x === 0
      || (x === matrix[0].length - 2 && y === 0)
      || (x === matrix[0].length - 2 && y === matrix.length - 1)
  }


}
