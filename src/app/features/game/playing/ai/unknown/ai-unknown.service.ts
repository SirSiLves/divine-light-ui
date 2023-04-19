import { Injectable } from '@angular/core';
import { GodType } from '../../../state/player/player.model';
import { Move } from '../../../state/action/move.model';
import { AiMinimaxingService } from '../minimaxing/ai-minimaxing.service';
import { Rewards } from '../rewards';
import { PgnLoaderComponent } from '../../../settings/pgn-loader/pgn-loader.component';

@Injectable({
  providedIn: 'root'
})
export class AiUnknownService {

  public static readonly MINIMAX_MAX_TIME_DURATION = 1000; // in ms
  public static readonly MINIMAX_MAX_TRAINING_TIME_DURATION = 100; // in ms
  public static readonly MINIMAX_SEARCH_DEPTH = 2;


  constructor(
    private aiMinimaxingService: AiMinimaxingService,
  ) {
  }


  getMove(matrix: number[][], isPlaying: GodType, bestDQNMove: Move): Move {
    // s21w0k03/1r11r03/2A31a01A2/4R12/a02A33/2R0K0W0a1S0-c
    const minimaxMoveRating: { move: Move, rating: number }[] = this.aiMinimaxingService.getRatedMovesForUnknown(
      matrix, isPlaying, AiUnknownService.MINIMAX_MAX_TIME_DURATION
    );

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

  getTrainingMove(matrix: number[][], isPlaying: GodType, bestDQNMove: Move): Move {
    const minimaxMoveRating: { move: Move, rating: number }[] = this.aiMinimaxingService.getTrainingRatedMovesForUnknown(
      matrix, isPlaying, AiUnknownService.MINIMAX_MAX_TRAINING_TIME_DURATION
    );

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
