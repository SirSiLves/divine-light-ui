import { Injectable } from '@angular/core';
import { GodType } from '../../../state/player/player.model';
import { Move } from '../../../state/action/move.model';
import { AiMinimaxingService } from '../minimaxing/ai-minimaxing.service';
import { AiDqn5Service } from '../dqn/dqn-5/ai-dqn-5.service';
import { Rewards } from '../rewards';
import { PgnLoaderComponent } from '../../../settings/pgn-loader/pgn-loader.component';

@Injectable({
  providedIn: 'root'
})
export class AiUnknownService {

  constructor(
    private aiMinimaxingService: AiMinimaxingService,
    private aiDqn5Service: AiDqn5Service
  ) {
  }

  getMove(matrix: number[][], isPlaying: GodType): Move {
    const minimaxMoveRating: { move: Move, rating: number }[] = this.aiMinimaxingService.getRatedMovesForUnknown(matrix, isPlaying);
    const bestDQNMove = this.aiDqn5Service.getMove(matrix, isPlaying);

    for (let i = 0; i < minimaxMoveRating.length; i++) {
      const moveRating = minimaxMoveRating[i];
      if (moveRating.rating === Rewards.WIN) return moveRating.move;

      if (moveRating.rating === Rewards.LOSE || moveRating.rating === Rewards.DRAW) {
        const minimaxPGN = PgnLoaderComponent.getMoveToPGN(moveRating.move, isPlaying);
        const dqnPGN = PgnLoaderComponent.getMoveToPGN(bestDQNMove, isPlaying);

        // dqn move will result in a loose, take the best possible minimax action
        if (minimaxPGN === dqnPGN) {
          const moves = minimaxMoveRating.map(entry => entry.move);
          const ratings = minimaxMoveRating.map(entry => entry.rating);
          const index = this.aiMinimaxingService.getBestIndexFromEvaluation(
            matrix, ratings, moves, isPlaying, true, true
          );

          return moves[index];
        }
      }
    }

    return bestDQNMove;
  }

}
