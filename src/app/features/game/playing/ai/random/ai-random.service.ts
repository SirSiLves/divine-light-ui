import { Injectable } from '@angular/core';
import { AiService } from '../ai.service';
import { Move } from '../../../state/action/move.model';
import { GodType } from '../../../state/player/player.model';

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
