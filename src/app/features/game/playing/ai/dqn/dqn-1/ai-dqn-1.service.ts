import { Injectable } from '@angular/core';
import { GodType } from '../../../../state/player/player.model';
import { Move } from '../../../../state/action/move.model';
import { AiService } from '../../ai.service';
import { AiDqnTrainService } from '../state/ai-dqn-train.service';
import { MatrixStore } from '../../../../state/matrix/matrix.store';

@Injectable({
  providedIn: 'root'
})
export class AiDqn1Service {

  private readonly DQN_SETTINGS = {
    model: 'divine-light-dqn1-model_' + MatrixStore.BOARD_SIZE
  };

  // model
  private model: any;


  constructor(
    private aiDqnTrainService: AiDqnTrainService
  ) {
  }

  init(): void {

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

  train(episodes: number, epsilon: number, isTraining: GodType): void {
    this.prepare(episodes, epsilon);
  }

  private prepare(episodes: number, epsilon: number): void {
    this.aiDqnTrainService.init(episodes, epsilon);
  }
}
