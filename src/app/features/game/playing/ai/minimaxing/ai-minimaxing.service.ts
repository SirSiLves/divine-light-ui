import { Injectable } from '@angular/core';
import { Move } from '../../../state/action/move.model';
import { GodType } from '../../../state/player/player.model';
import { AiService } from '../ai.service';
import { DrawValidatorService } from '../../../validator/draw-validator.service';
import { Rewards } from '../rewards';
import { ExecutedNode, PieceNode } from './node.model';
import { MoveValidatorService } from '../../../validator/move-validator.service';
import { Field } from '../../../state/action/field.model';
import { PieceType } from '../../../board/piece/piece';
import { PieceComponent } from '../../../board/piece/piece.component';
import { MatrixQuery } from '../../../state/matrix/matrix.query';
import { MatrixService } from '../../../state/matrix/matrix.service';
import { AiRandomService } from '../random/ai-random.service';


@Injectable({
  providedIn: 'root'
})
export class AiMinimaxingService {

  // 1 - minimax
  // 2 - minimax with alpha beta pruning
  // 3 - minimax with alpha beta pruning and iterative deepening
  // 4 - minimax with alpha beta pruning, iterative deepening and move generation
  // 5 - minimax with alpha beta pruning, iterative deepening, move generation and evaluation function
  // 6 - custom - not relevant for MAS
  public static EXTENSION_SETTING: 1 | 2 | 3 | 4 | 5 = 5;

  private readonly DEPTH_SEARCH = 2;
  private readonly MAX_DEPTH_SEARCH = 100;
  public readonly MAX_TIME_DURATION = 2000; // in ms

  constructor(
    private drawValidatorService: DrawValidatorService
  ) {
  }

  getMove(matrix: number[][], isPlaying: GodType): Move {
    switch (AiMinimaxingService.EXTENSION_SETTING) {
      case 1:
        return this.getMove1(matrix, isPlaying);
      case 2:
        return this.getMove2(matrix, isPlaying);
      case 3:
        return this.getMove3(matrix, isPlaying);
      case 4:
        return this.getMove4(matrix, isPlaying);
      case 5:
        return this.getMove5(matrix, isPlaying);
      default:
        return this.getMove5(matrix, isPlaying);
    }
  }

  // plain minimax without any extensions
  getMove1(matrix: number[][], isPlaying: GodType): Move {
    const moves: Move[] = AiService.shuffle(AiService.getPossiblesMoves(matrix, isPlaying));
    const evaluatedMoves: number[] = moves.map(
      move => this.minimax1(matrix, this.DEPTH_SEARCH - 1, move, isPlaying, isPlaying)
    );

    // console.log('MINIMAX 1');

    const index = this.getBestIndexFromEvaluation(matrix, evaluatedMoves, moves, isPlaying, true, false);
    return moves[index];
  }

  // minimax with alpha beta pruning
  getMove2(matrix: number[][], isPlaying: GodType): Move {
    const moves: Move[] = AiService.shuffle(AiService.getPossiblesMoves(matrix, isPlaying));
    const evaluatedMoves: number[] = moves.map(
      move => this.minimax2(matrix, this.DEPTH_SEARCH - 1, move, isPlaying, isPlaying, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    );

    // console.log('MINIMAX 2');

    const index = this.getBestIndexFromEvaluation(matrix, evaluatedMoves, moves, isPlaying, true, false);
    return moves[index];
  }

  // minimax with alpha beta pruning and iterative deepening
  getMove3(matrix: number[][], isPlaying: GodType): Move {
    let startTime = Date.now();
    let maxDepthPerIteration = 0;

    let iterativeDeepening: { started: number[], completed: number[] } = {started: [], completed: []};

    const nodes: ExecutedNode[] = this.generateChildNodesWithReward(matrix, isPlaying, 1, true);

    while ((Date.now() - startTime) < this.MAX_TIME_DURATION && maxDepthPerIteration < this.MAX_DEPTH_SEARCH) {
      maxDepthPerIteration += 1;
      iterativeDeepening.completed = iterativeDeepening.started;

      iterativeDeepening.started = nodes.map(node => this.minimax3(
          node.nextState, node.reward, node.done, 1, maxDepthPerIteration, isPlaying, node.isPlaying,
          Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, startTime, this.MAX_TIME_DURATION
        )
      );
    }

    // console.log('MINIMAX 3: ', maxDepthPerIteration - 1);

    const moves = nodes.map(n => n.move);
    const index = this.getBestIndexFromEvaluation(matrix, iterativeDeepening.completed, moves, isPlaying, true, false);
    return moves[index];
  }

  // minimax with alpha beta pruning, iterative deepening and move generation
  getMove4(matrix: number[][], isPlaying: GodType): Move {
    let startTime = Date.now();
    let maxDepthPerIteration = 0;

    let iterativeDeepening: { started: number[], completed: number[] } = {started: [], completed: []};

    const nodes: ExecutedNode[] = this.generateChildNodesWithReward(matrix, isPlaying, 1, true);

    while ((Date.now() - startTime) < this.MAX_TIME_DURATION && maxDepthPerIteration < this.MAX_DEPTH_SEARCH) {
      maxDepthPerIteration += 1;
      iterativeDeepening.completed = iterativeDeepening.started;

      iterativeDeepening.started = nodes.map(node => this.minimax4(
          node.nextState, node.reward, node.done, 1, maxDepthPerIteration, isPlaying, node.isPlaying,
          Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, startTime, this.MAX_TIME_DURATION
        )
      );
    }

    // console.log('MINIMAX 4: ', maxDepthPerIteration - 1);

    const moves = nodes.map(n => n.move);
    const index = this.getBestIndexFromEvaluation(matrix, iterativeDeepening.completed, moves, isPlaying, true, false);
    return moves[index];
  }


  // minimax with alpha beta pruning, iterative deepening, move generation and evaluation function
  getMove5(matrix: number[][], isPlaying: GodType): Move {
    let startTime = Date.now();
    let maxDepthPerIteration = 0;

    let iterativeDeepening: { started: number[], completed: number[] } = {started: [], completed: []};

    const nodes: ExecutedNode[] = this.generateChildNodesWithRewardSorted(matrix, isPlaying, 1, true);

    while ((Date.now() - startTime) < this.MAX_TIME_DURATION && maxDepthPerIteration < this.MAX_DEPTH_SEARCH) {
      maxDepthPerIteration += 1;
      iterativeDeepening.completed = iterativeDeepening.started;

      iterativeDeepening.started = nodes.map(node => this.minimax5(
          node.nextState, node.reward, node.done, 1, maxDepthPerIteration, isPlaying, node.isPlaying,
          Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, startTime, this.MAX_TIME_DURATION, node.evaluation
        )
      );
    }

    // console.log('MINIMAX 5: ', maxDepthPerIteration - 1);

    const moves = nodes.map(n => n.move);
    const index = this.getBestIndexFromEvaluation(matrix, iterativeDeepening.completed, moves, isPlaying, true, true);
    return moves[index];
  }

  // custom
  getMove6(matrix: number[][], isPlaying: GodType): Move {
    let startTime = Date.now();
    let maxDepthPerIteration = 0;

    let iterativeDeepening: { started: number[], completed: number[] } = {started: [], completed: []};

    const nodes: ExecutedNode[] = this.generateChildNodesWithReward(matrix, isPlaying, 1, true);

    while ((Date.now() - startTime) < this.MAX_TIME_DURATION && maxDepthPerIteration < this.MAX_DEPTH_SEARCH) {
      maxDepthPerIteration += 1;
      iterativeDeepening.completed = iterativeDeepening.started;

      iterativeDeepening.started = nodes.map(node => this.minimax6(
          node.nextState, node.reward, node.done, 1, maxDepthPerIteration, isPlaying, node.isPlaying,
          Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, startTime, this.MAX_TIME_DURATION, node.evaluation
        )
      );
    }

    // console.log('MINIMAX 6: ', maxDepthPerIteration - 1);

    const moves = nodes.map(n => n.move);
    const index = this.getBestIndexFromEvaluation(matrix, iterativeDeepening.completed, moves, isPlaying, true, true);
    return moves[index];
  }

  getRatedMovesForUnknown(matrix: number[][], isPlaying: GodType, maxTimeDuration: number): { move: Move, rating: number }[] {
    let startTime = Date.now();
    let maxDepthPerIteration = 0;

    let iterativeDeepening: { started: number[], completed: number[] } = {started: [], completed: []};

    const nodes: ExecutedNode[] = this.generateChildNodesWithRewardSorted(matrix, isPlaying, 1, false);

    while ((Date.now() - startTime) < maxTimeDuration && maxDepthPerIteration < this.MAX_DEPTH_SEARCH) {
      maxDepthPerIteration += 1;
      iterativeDeepening.completed = iterativeDeepening.started;

      iterativeDeepening.started = nodes.map(node => this.minimax5(
          node.nextState, node.reward, node.done, 1, maxDepthPerIteration, isPlaying, node.isPlaying,
          Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, startTime, maxTimeDuration, node.evaluation
        )
      );
    }

    // console.log('MINIMAX RATING MOVES FOR UNKNOWN: ', maxDepthPerIteration - 1);

    return nodes.map((node, index) => {
      return {
        move: node.move,
        rating: iterativeDeepening.completed[index]
      }
    });

    // const moves: Move[] = AiService.shuffle(AiService.getPossiblesMoves(matrix, isPlaying));
    // const evaluatedMoves: number[] = moves.map(
    //   move => this.minimax2(matrix, AiUnknownService.MINIMAX_SEARCH_DEPTH - 1, move, isPlaying, isPlaying, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    // );
    //
    // return moves.map((move, index) => {
    //   return {
    //     move: move,
    //     rating: evaluatedMoves[index]
    //   }
    // });
  }

  getTrainingRatedMovesForUnknown(matrix: number[][], isPlaying: GodType, maxTimeDuration: number): { move: Move, rating: number }[] {
    // const moves: Move[] = AiService.shuffle(AiService.getPossiblesMoves(matrix, isPlaying));
    // const evaluatedMoves: number[] = moves.map(
    //   move => this.minimax2(matrix, AiUnknownService.MINIMAX_SEARCH_DEPTH - 1, move, isPlaying, isPlaying, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
    // );
    //
    // return moves.map((move, index) => {
    //   return {
    //     move: move,
    //     rating: evaluatedMoves[index]
    //   }
    // });

    let startTime = Date.now();
    let maxDepthPerIteration = 0;

    let iterativeDeepening: { started: number[], completed: number[] } = {started: [], completed: []};

    const nodes: ExecutedNode[] = this.generateChildNodesWithReward(matrix, isPlaying, 1, false);

    while ((Date.now() - startTime) < maxTimeDuration && maxDepthPerIteration < this.MAX_DEPTH_SEARCH) {
      maxDepthPerIteration += 1;
      iterativeDeepening.completed = iterativeDeepening.started;

      iterativeDeepening.started = nodes.map(node => this.minimax5(
          node.nextState, node.reward, node.done, 1, maxDepthPerIteration, isPlaying, node.isPlaying,
          Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, startTime, maxTimeDuration, node.evaluation
        )
      );
    }

    // console.log('MINIMAX 5 RATING MOVES FOR UNKNOWN: ', maxDepthPerIteration - 1);

    return nodes.map((node, index) => {
      return {
        move: node.move,
        rating: iterativeDeepening.completed[index]
      }
    });
  }

  // plain minimax without any extensions
  private minimax1(matrix: number[][], depth: number, testingMove: Move, startPlayer: GodType, isPlaying: GodType): number {
    // execute move and get reward
    let {reward, nextState, winner} = AiService.executeMoveWithReward(matrix, testingMove, isPlaying);

    // terminal state return reward from the last move
    if (winner !== undefined) {
      if (isPlaying === startPlayer) return reward;
      return -1 * reward;
    } else if (depth === 0) {
      if (isPlaying === startPlayer) return reward;
      return -1 * reward;
    }

    // switch playing
    const nextPlayerType = isPlaying === GodType.CAMAXTLI ? GodType.NANAHUATZIN : GodType.CAMAXTLI;

    // get possible move and randomize it
    const moves: Move[] = AiService.shuffle(AiService.getPossiblesMoves(nextState, nextPlayerType));

    const isMaximizing = startPlayer === nextPlayerType;

    if (isMaximizing) {
      let maxEvaluation = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < moves.length; i++) {
        let evaluation: number = this.minimax1(nextState, depth - 1, moves[i], startPlayer, nextPlayerType);
        maxEvaluation = Math.max(maxEvaluation, evaluation);
      }

      return maxEvaluation;
    } else {
      let minEvaluation = Number.POSITIVE_INFINITY;
      for (let i = 0; i < moves.length; i++) {
        let evaluation: number = this.minimax1(nextState, depth - 1, moves[i], startPlayer, nextPlayerType);
        minEvaluation = Math.min(minEvaluation, evaluation);
      }

      return minEvaluation;
    }
  }

  private minimax2(matrix: number[][], depth: number, testingMove: Move, startPlayer: GodType, isPlaying: GodType, alpha: number, beta: number): number {
    // execute move and get reward
    let {reward, nextState, winner} = AiService.executeMoveWithReward(matrix, testingMove, isPlaying);

    // terminal state return reward from the last move
    if (winner !== undefined) {
      if (isPlaying === startPlayer) return reward;
      return -1 * reward;
    } else if (depth === 0) {
      if (isPlaying === startPlayer) return reward;
      return -1 * reward;
    }

    // switch playing
    const nextPlayerType = isPlaying === GodType.CAMAXTLI ? GodType.NANAHUATZIN : GodType.CAMAXTLI;

    // get possible move and randomize it
    const moves: Move[] = AiService.shuffle(AiService.getPossiblesMoves(nextState, nextPlayerType));

    const isMaximizing = startPlayer === nextPlayerType;

    if (isMaximizing) {
      let maxEvaluation = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < moves.length; i++) {
        let evaluation: number = this.minimax2(nextState, depth - 1, moves[i], startPlayer, nextPlayerType, alpha, beta);
        maxEvaluation = Math.max(maxEvaluation, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }

      return maxEvaluation;
    } else {
      let minEvaluation = Number.POSITIVE_INFINITY;
      for (let i = 0; i < moves.length; i++) {
        let evaluation: number = this.minimax2(nextState, depth - 1, moves[i], startPlayer, nextPlayerType, alpha, beta);
        minEvaluation = Math.min(minEvaluation, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }

      return minEvaluation;
    }
  }

  getBestIndexFromEvaluation(
    matrix: number[][], evaluatedMoves: number[], moves: Move[], isPlaying: GodType, isMaximizing: boolean, evaluatePosition: boolean
  ): number {
    let bestIndex = 0;
    let bestIndexList = [];
    for (let i = 0; i < evaluatedMoves.length; i++) {
      if (evaluatedMoves[i] >= evaluatedMoves[bestIndex]) {
        if (evaluatedMoves[i] > evaluatedMoves[bestIndex]) bestIndexList = [];
        bestIndex = i;
        bestIndexList.push(i);
      }
    }

    let bestReward = this.getReward(matrix, moves[bestIndexList[0]], isPlaying, isMaximizing, evaluatePosition);
    let bestRewardIndex = 0;
    for (let i = 1; i < bestIndexList.length; i++) {
      const move: Move = moves[bestIndexList[i]];
      const reward = this.getReward(matrix, move, isPlaying, isMaximizing, evaluatePosition);
      if (bestReward < reward) {
        bestReward = reward;
        bestRewardIndex = i;
      }
    }

    return bestIndexList[bestRewardIndex];
  }

  getReward(matrix: number[][], move: Move, isPlaying: GodType, isMaximizing: boolean, evaluatePosition: boolean): number {
    // pieces from both players involved in light
    const stateAfterMove = AiService.executeMove(move, matrix, isPlaying);

    const {reward, nextState, winner, lightCount} = AiService.executeLightWithReward(stateAfterMove, isPlaying);

    if (winner !== undefined) return isMaximizing ? reward : reward * -1;

    const draw = this.drawValidatorService.checkDrawWithoutSave(nextState);
    if (draw) return isMaximizing ? Rewards.DRAW : Rewards.DRAW * -1;
    else if (evaluatePosition) {
      // pieces involved in light from both players - light should be checked piece before they are removed
      let lightEvaluation = lightCount;
      if (!isMaximizing) lightEvaluation = -1 * lightEvaluation; // revert result otherwise AI is training to block the light

      const adjustPosition = AiService.evaluatePosition(nextState, isPlaying);

      // generate random number to get more randomize positions
      const randomNumber = AiRandomService.generateRandomNumber(0, Rewards.RANDOMIZE);

      return reward + adjustPosition + lightEvaluation + randomNumber;
    } else {
      return reward;
    }
  }

  private generateChildNodesWithReward(matrix: number[][], isPlaying: GodType, depth: number, filter: boolean): ExecutedNode[] {
    const nodes = AiService.getPossiblesMoves(matrix, isPlaying)
      .map(move => {
        // execute move and get reward
        const {reward, nextState, winner} = AiService.executeMoveWithReward(matrix, move, isPlaying);

        if (winner !== undefined) {
          return {
            state: matrix,
            move,
            isPlaying,
            reward,
            winner,
            nextState,
            depth,
            done: true,
            evaluation: 0
          };
        }

        const draw = this.drawValidatorService.checkDrawWithoutSave(nextState);
        if (draw) {
          return {
            state: matrix,
            move,
            isPlaying,
            reward: Rewards.DRAW,
            winner,
            nextState,
            depth,
            done: true,
            evaluation: 0
          };
        }

        return {
          state: matrix,
          move,
          isPlaying,
          reward: reward,
          winner,
          nextState,
          depth,
          done: false,
          evaluation: 0
        };
      });

    if (!filter) return AiService.shuffle(nodes);

    const filteredNodes = nodes.filter(n => n.reward > Rewards.DESTROY_OWN);
    if (filteredNodes.length === 0) {
      return AiService.shuffle(nodes);
    }

    return AiService.shuffle(filteredNodes);
  }

  private generateChildNodesWithRewardSorted(matrix: number[][], isPlaying: GodType, depth: number, filter: boolean): ExecutedNode[] {
    const nodes = AiService.getPossiblesMoves(matrix, isPlaying)
      .map(move => {
        const stateAfterMove = AiService.executeMove(move, matrix, isPlaying);
        const {reward, nextState, winner, lightCount} = AiService.executeLightWithReward(stateAfterMove, isPlaying);

        if (winner !== undefined) {
          return {
            state: matrix,
            move,
            isPlaying,
            reward,
            winner,
            nextState,
            depth,
            done: true,
            evaluation: lightCount
          };
        }

        const draw = this.drawValidatorService.checkDrawWithoutSave(nextState);
        if (draw) {
          return {
            state: matrix,
            move,
            isPlaying,
            reward: Rewards.DRAW,
            winner,
            nextState,
            depth,
            done: true,
            evaluation: lightCount
          };
        }

        return {
          state: matrix,
          move,
          isPlaying,
          reward: reward,
          winner,
          nextState,
          depth,
          done: false,
          evaluation: lightCount
        };
      });

    if (!filter) return this.sortNodes(nodes);

    const filteredNodes = nodes.filter(n => n.reward > Rewards.DESTROY_OWN);
    if (filteredNodes.length === 0) {
      return this.sortNodes(nodes);
    }

    return this.sortNodes(filteredNodes);
  }

  private sortNodes(nodes: ExecutedNode[]) {
    return nodes.sort((a, b) => b.reward - a.reward);
  }

  // minimax with alpha beta pruning and iterative deepening
  private minimax3(nextState: number[][], reward: number, done: boolean, depth: number, maxDepth: number,
                   startPlayer: GodType, isPlaying: GodType, alpha: number, beta: number, startTime: number, maxTimeDuration: number): number {
    // terminal state return reward from the last move
    if (done || depth >= maxDepth || (Date.now() - startTime) >= maxTimeDuration) {
      if (done) {
        if (isPlaying === startPlayer) return reward;
        return -1 * reward;
      } else {
        if (isPlaying === startPlayer) return reward;
        return -1 * reward;
      }
    }

    // switch playing
    const nextPlayer = isPlaying === GodType.CAMAXTLI ? GodType.NANAHUATZIN : GodType.CAMAXTLI;

    // get possible move and randomize it
    const nodes: ExecutedNode[] = this.generateChildNodesWithReward(nextState, nextPlayer, depth, true);

    const isMaximizing = startPlayer === nextPlayer;

    if (isMaximizing) {
      let maxEvaluation = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < nodes.length; i++) {
        const child = nodes[i];
        let evaluation: number = this.minimax3(
          child.nextState, child.reward, child.done, depth + 1, maxDepth, startPlayer, child.isPlaying, alpha, beta, startTime, maxTimeDuration
        );

        maxEvaluation = Math.max(maxEvaluation, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }

      return maxEvaluation;
    } else {
      let minEvaluation = Number.POSITIVE_INFINITY;
      for (let i = 0; i < nodes.length; i++) {
        const child = nodes[i];
        let evaluation: number = this.minimax3(
          child.nextState, child.reward, child.done, depth + 1, maxDepth, startPlayer, child.isPlaying, alpha, beta, startTime, maxTimeDuration
        );

        minEvaluation = Math.min(minEvaluation, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }

      return minEvaluation;
    }
  }


  // minimax with alpha beta pruning, iterative deepening and move generation
  private minimax4(nextState: number[][], reward: number, done: boolean, depth: number, maxDepth: number,
                   startPlayer: GodType, isPlaying: GodType, alpha: number, beta: number, startTime: number, maxTimeDuration: number): number {
    // terminal state return reward from the last move
    if (done || depth >= maxDepth || (Date.now() - startTime) >= maxTimeDuration) {
      if (done) {
        if (isPlaying === startPlayer) return reward;
        return -1 * reward;
      } else {
        if (isPlaying === startPlayer) return reward;
        return -1 * reward;
      }
    }

    // switch playing
    const nextPlayer = isPlaying === GodType.CAMAXTLI ? GodType.NANAHUATZIN : GodType.CAMAXTLI;
    const isMaximizing = startPlayer === nextPlayer;

    let minEvaluation = Number.POSITIVE_INFINITY;
    let maxEvaluation = Number.NEGATIVE_INFINITY;

    // get possible pieces
    const nodes: PieceNode[] = this.generateChildNode(nextState, nextPlayer, depth);
    if (nodes.length === 0) return reward;

    if (isMaximizing) {
      let stop = false;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // get possible moves
        const possibleWalkFields = AiService.shuffle(MoveValidatorService.getPossibleFields(node.piece, node.position.x, node.position.y, node.state));

        for (let j = 0; j < possibleWalkFields.length; j++) {
          let evaluation: number = this.getEvaluation4(
            possibleWalkFields[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          maxEvaluation = Math.max(maxEvaluation, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;

        // get possible moves
        const possibleRotations = AiService.shuffle(MoveValidatorService.getPossibleRotations(node.piece, node.position.x, node.position.y));
        for (let j = 0; j < possibleRotations.length; j++) {
          let evaluation: number = this.getEvaluation4(
            possibleRotations[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          maxEvaluation = Math.max(maxEvaluation, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;
      }

      return maxEvaluation;

    } else {
      let stop = false;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // get possible moves
        const possibleWalkFields = MoveValidatorService.getPossibleFields(node.piece, node.position.x, node.position.y, node.state);
        for (let j = 0; j < possibleWalkFields.length; j++) {
          let evaluation: number = this.getEvaluation4(
            possibleWalkFields[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          minEvaluation = Math.min(minEvaluation, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;

        // get possible moves
        const possibleRotations = MoveValidatorService.getPossibleRotations(node.piece, node.position.x, node.position.y);
        for (let j = 0; j < possibleRotations.length; j++) {
          let evaluation: number = this.getEvaluation4(
            possibleRotations[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          minEvaluation = Math.min(minEvaluation, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;
      }

      return minEvaluation;
    }
  }

  private generateChildNode(matrix: number[][], isPlaying: GodType, depth: number): PieceNode[] {
    const pieces: PieceNode[] = [];

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const piece = matrix[y][x];
        const fromField: Field = {x, y};

        if (PieceComponent.getType(piece) !== PieceType.NONE) {
          if (isPlaying === GodType.NANAHUATZIN && piece >= 100) {
            pieces.push({
              state: matrix,
              piece,
              position: fromField,
              isPlaying,
              depth
            })
          } else if (isPlaying === GodType.CAMAXTLI && piece < 100) {
            pieces.push({
              state: matrix,
              piece,
              position: fromField,
              isPlaying,
              depth
            })
          }
        }
      }
    }

    return pieces;
  }

  private generateChildNodeSorted(matrix: number[][], isPlaying: GodType, depth: number): PieceNode[] {
    const pieces: PieceNode[] = [];

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const piece = matrix[y][x];
        const fromField: Field = {x, y};

        if (PieceComponent.getType(piece) !== PieceType.NONE) {
          if (isPlaying === GodType.NANAHUATZIN && piece >= 100) {
            pieces.push({
              state: matrix,
              piece,
              position: fromField,
              isPlaying,
              depth
            });
          } else if (isPlaying === GodType.CAMAXTLI && piece < 100) {
            pieces.push({
              state: matrix,
              piece,
              position: fromField,
              isPlaying,
              depth
            });
          }
        }
      }
    }

    return pieces.sort((a, b) => {
      if (PieceComponent.getType(a.piece) === PieceType.REFLECTOR && PieceComponent.getType(b.piece) !== PieceType.REFLECTOR) {
        return -1;
      }

      if (PieceComponent.getType(a.piece) === PieceType.ANGLER && PieceComponent.getType(b.piece) !== PieceType.ANGLER) {
        return -1;
      }

      if (PieceComponent.getType(a.piece) === PieceType.KING) {
        return 1;
      }

      return 0;
    });
  }

  private getEvaluation4(move: Move, node: PieceNode, isPlaying: GodType, depth: number, maxDepth: number,
                         startPlayer: GodType, alpha: number, beta: number, startTime: number, maxTimeDuration: number) {
    this.executeMoveWithReward(move, node, isPlaying);

    return this.minimax4(
      node.nextState!, node.reward!, node.done!, depth + 1, maxDepth, startPlayer, node.isPlaying, alpha, beta, startTime, maxTimeDuration
    );
  }

  private executeMoveWithReward(move: Move, node: PieceNode, isPlaying: GodType): void {
    node.move = move;
    const {reward, nextState, winner, lightCount} = AiService.executeMoveWithReward(node.state, move, isPlaying);
    node.reward = reward;
    node.nextState = nextState;
    node.winner = winner;
    node.done = winner !== undefined;

    if (!node.done) {
      const draw = this.drawValidatorService.checkDrawWithoutSave(nextState);
      if (draw) {
        node.done = true;
        node.reward = Rewards.DRAW
      } else {
        node.evaluation = lightCount;
      }
    }
  }

  // minimax with alpha beta pruning, iterative deepening, move generation and evaluation function
  private minimax5(nextState: number[][], reward: number, done: boolean, depth: number, maxDepth: number,
                   startPlayer: GodType, isPlaying: GodType, alpha: number, beta: number, startTime: number, maxTimeDuration: number,
                   lightEvaluation: number): number {
    // terminal state return reward from the last move
    if (done || depth >= maxDepth || (Date.now() - startTime) >= maxTimeDuration) {
      if (done) {
        if (isPlaying === startPlayer) return reward;
        return -1 * reward;
      } else {
        const adjustPosition = this.getAdjustPosition(nextState, isPlaying, isPlaying === startPlayer, lightEvaluation);
        if (isPlaying === startPlayer) return reward + adjustPosition;
        return -1 * (reward + adjustPosition);
      }
    }

    // switch playing
    const nextPlayer = isPlaying === GodType.CAMAXTLI ? GodType.NANAHUATZIN : GodType.CAMAXTLI;
    const isMaximizing = startPlayer === nextPlayer;

    let minEvaluation = Number.POSITIVE_INFINITY;
    let maxEvaluation = Number.NEGATIVE_INFINITY;

    // get possible pieces
    // const nodes: PieceNode[] = this.generateChildNode(nextState, nextPlayer, depth);
    const nodes: PieceNode[] = this.generateChildNodeSorted(nextState, nextPlayer, depth);
    if (nodes.length === 0) return reward;

    if (isMaximizing) {
      let stop = false;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // get possible moves
        const possibleWalkFields = AiService.shuffle(MoveValidatorService.getPossibleFields(node.piece, node.position.x, node.position.y, node.state));

        for (let j = 0; j < possibleWalkFields.length; j++) {
          let evaluation: number = this.getEvaluation5(
            possibleWalkFields[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          maxEvaluation = Math.max(maxEvaluation, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;

        // get possible moves
        const possibleRotations = AiService.shuffle(MoveValidatorService.getPossibleRotations(node.piece, node.position.x, node.position.y));
        for (let j = 0; j < possibleRotations.length; j++) {
          let evaluation: number = this.getEvaluation5(
            possibleRotations[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          maxEvaluation = Math.max(maxEvaluation, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;
      }

      return maxEvaluation;

    } else {
      let stop = false;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // get possible moves
        const possibleWalkFields = MoveValidatorService.getPossibleFields(node.piece, node.position.x, node.position.y, node.state);
        for (let j = 0; j < possibleWalkFields.length; j++) {
          let evaluation: number = this.getEvaluation5(
            possibleWalkFields[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          minEvaluation = Math.min(minEvaluation, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;

        // get possible moves
        const possibleRotations = MoveValidatorService.getPossibleRotations(node.piece, node.position.x, node.position.y);
        for (let j = 0; j < possibleRotations.length; j++) {
          let evaluation: number = this.getEvaluation5(
            possibleRotations[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          minEvaluation = Math.min(minEvaluation, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;
      }

      return minEvaluation;
    }
  }

  private getEvaluation5(move: Move, node: PieceNode, isPlaying: GodType, depth: number, maxDepth: number,
                         startPlayer: GodType, alpha: number, beta: number, startTime: number, maxTimeDuration: number) {
    this.executeMoveWithReward(move, node, isPlaying);

    return this.minimax5(
      node.nextState!, node.reward!, node.done!, depth + 1, maxDepth, startPlayer, node.isPlaying, alpha, beta, startTime, maxTimeDuration, node.evaluation!
    );
  }

  private minimax6(nextState: number[][], reward: number, done: boolean, depth: number, maxDepth: number,
                   startPlayer: GodType, isPlaying: GodType, alpha: number, beta: number, startTime: number, maxTimeDuration: number,
                   lightEvaluation: number): number {
    // terminal state return reward from the last move
    if (done || depth >= maxDepth || (Date.now() - startTime) >= maxTimeDuration) {
      if (done) {
        if (isPlaying === startPlayer) return reward;
        return -1 * reward;
      } else {
        return this.getPositionEvaluation(nextState, isPlaying, startPlayer, lightEvaluation, reward);
      }
    }

    // switch playing
    const nextPlayer = isPlaying === GodType.CAMAXTLI ? GodType.NANAHUATZIN : GodType.CAMAXTLI;
    const isMaximizing = startPlayer === nextPlayer;

    let minEvaluation = Number.POSITIVE_INFINITY;
    let maxEvaluation = Number.NEGATIVE_INFINITY;

    // get possible pieces
    const nodes: PieceNode[] = this.generateChildNodeSorted(nextState, nextPlayer, depth);
    if (nodes.length === 0) return reward;

    if (isMaximizing) {
      let stop = false;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // get possible moves
        const possibleWalkFields = AiService.shuffle(MoveValidatorService.getPossibleFields(node.piece, node.position.x, node.position.y, node.state));

        for (let j = 0; j < possibleWalkFields.length; j++) {
          let evaluation: number = this.getEvaluation6(
            possibleWalkFields[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          maxEvaluation = Math.max(maxEvaluation, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;

        // get possible moves
        const possibleRotations = AiService.shuffle(MoveValidatorService.getPossibleRotations(node.piece, node.position.x, node.position.y));
        for (let j = 0; j < possibleRotations.length; j++) {
          let evaluation: number = this.getEvaluation6(
            possibleRotations[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          maxEvaluation = Math.max(maxEvaluation, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;
      }

      return maxEvaluation;

    } else {
      let stop = false;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // get possible moves
        const possibleWalkFields = MoveValidatorService.getPossibleFields(node.piece, node.position.x, node.position.y, node.state);
        for (let j = 0; j < possibleWalkFields.length; j++) {
          let evaluation: number = this.getEvaluation6(
            possibleWalkFields[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          minEvaluation = Math.min(minEvaluation, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;

        // get possible moves
        const possibleRotations = MoveValidatorService.getPossibleRotations(node.piece, node.position.x, node.position.y);
        for (let j = 0; j < possibleRotations.length; j++) {
          let evaluation: number = this.getEvaluation6(
            possibleRotations[j], node, node.isPlaying, depth, maxDepth, startPlayer, alpha, beta, startTime, maxTimeDuration
          );

          minEvaluation = Math.min(minEvaluation, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) {
            stop = true;
            break;
          }
        }

        // prune if true
        if (stop) break;
      }

      return minEvaluation;
    }
  }

  private getPositionEvaluation(nextState: number[][], isPlaying: GodType, startPlayer: GodType, lightEvaluation: number, reward: number) {
    // generate random number to get more randomize positions
    const randomNumber = AiRandomService.generateRandomNumber(0, Rewards.RANDOMIZE);
    // position evaluation
    const positionEvaluation = AiService.evaluatePosition(nextState, isPlaying);

    // pieces involved in light from both players - light should be checked piece before they are removed
    if (isPlaying !== startPlayer) lightEvaluation = -1 * lightEvaluation; // invert result otherwise AI is training to block the light

    lightEvaluation = randomNumber + lightEvaluation + positionEvaluation;

    if (isPlaying === startPlayer) return reward + lightEvaluation;
    return -1 * (reward + lightEvaluation);
  }

  private getEvaluation6(move: Move, node: PieceNode, isPlaying: GodType, depth: number, maxDepth: number,
                         startPlayer: GodType, alpha: number, beta: number, startTime: number, maxTimeDuration: number) {
    this.executeMoveWithReward(move, node, isPlaying);

    return this.minimax6(
      node.nextState!, node.reward!, node.done!, depth + 1, maxDepth, startPlayer, node.isPlaying, alpha, beta, startTime, maxTimeDuration, node.evaluation!
    );
  }

  private getAdjustPosition(matrix: number[][], isPlaying: GodType, isMaximizing: boolean, lightReward: number) {
    const isSwappedPosition = MatrixQuery.isSwappedMatrixPosition(matrix);
    const normalizedNextState = isSwappedPosition ? MatrixService.swapMatrix(matrix) : matrix;

    // evaluate curren position
    let adjustReward = AiService.evaluatePosition(normalizedNextState, isPlaying);

    // generate random number to get more randomize positions
    const randomNumber = AiRandomService.generateRandomNumber(0, Rewards.RANDOMIZE);

    if (!isMaximizing) return adjustReward + -1 * lightReward + randomNumber; // invert result from light otherwise AI is training to block the light
    return adjustReward + lightReward + randomNumber;
  }

}
