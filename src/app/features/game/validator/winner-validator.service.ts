import { Injectable } from '@angular/core';
import { GodType, Player } from '../state/player/player.model';
import { PieceType } from '../board/piece/piece';
import { PieceComponent } from '../board/piece/piece.component';

@Injectable({
  providedIn: 'root'
})
export class WinnerValidatorService {

  constructor() {
  }


  static checkWinnerWithPlayer(matrix: number[][], player1: Player, player2: Player): Player | undefined {
    let kingC = false; // Camaxtli
    let kingN = false; // Nanahuatzin

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const piece = matrix[y][x];
        if (PieceComponent.getType(piece) === PieceType.KING) {
          if (piece < 100) {
            kingC = true
          }
          if (piece >= 100) {
            kingN = true
          }
        }
      }
    }

    return kingC && !kingN ? player1 : !kingC && kingN ? player2 : undefined;
  }

  static checkWinnerWithGod(matrix: number[][]): GodType | undefined {
    let kingC = false; // Camaxtli
    let kingN = false; // Nanahuatzin

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const piece = matrix[y][x];
        if (PieceComponent.getType(piece) === PieceType.KING) {
          if (piece < 100) {
            kingC = true
          }
          if (piece >= 100) {
            kingN = true
          }
        }
      }
    }

    return kingC && !kingN ? GodType.CAMAXTLI : !kingC && kingN ? GodType.NANAHUATZIN : undefined;
  }
}
