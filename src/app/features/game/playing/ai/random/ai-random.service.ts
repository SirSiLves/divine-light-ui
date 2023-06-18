import { Injectable } from '@angular/core';
import { AiService } from '../ai.service';
import { Move } from '../../../state/action/move.model';
import { GodType } from '../../../state/player/player.model';
import {WinnerValidatorService} from "../../../validator/winner-validator.service";

@Injectable({
  providedIn: 'root'
})
export class AiRandomService {

  constructor() {
  }

  getMove(matrix: number[][], isPlaying: GodType): Move {
    // console.log('execute random move');

    const moves: Move[] = AiService.getPossiblesMoves(matrix, isPlaying);
    return moves[this.generateRandomNumber(0, moves.length - 1)];
  }

  getFilteredMove(matrix: number[][], isPlaying: GodType): Move {
    // console.log('execute random move');

    const moves: Move[] = AiService.getPossiblesMoves(matrix, isPlaying);

    // RANDOM is never killing himself improves learning to kill opponent
    const filteredMoves: Move[] = moves.filter(m => {
      const execution = AiService.executeMoveWithReward(matrix, m, isPlaying);

      if (execution.winner !== undefined && execution.winner !== isPlaying) {
        return false;
      }

      // check if trainer can win without doing something, if its so filter this move
      AiService.executeLight(execution.nextState, isPlaying);
      const winner: GodType | undefined = WinnerValidatorService.checkWinnerWithGod(execution.nextState);

      if (winner !== undefined && winner === isPlaying) {
        return false;
      }

      return true;
    });

    if (filteredMoves.length > 0) {
      return filteredMoves[this.generateRandomNumber(0, filteredMoves.length - 1)];
    }

    return moves[this.generateRandomNumber(0, moves.length - 1)];
  }


  generateRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generateRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
