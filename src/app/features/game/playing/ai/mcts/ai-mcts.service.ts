import { Injectable } from '@angular/core';
import { GodType } from '../../../state/player/player.model';
import { Move } from '../../../state/action/move.model';
import { AiService } from '../ai.service';


@Injectable({
  providedIn: 'root'
})
export class AiMctsService {

  constructor(
  ) {
  }

  getMove(matrix: number[][], isPlaying: GodType): Move {
    const moves: Move[] = AiService.getPossiblesMoves(matrix, isPlaying);
    return moves[this.generateRandomNumber(0, moves.length - 1)];
  }

  generateRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
