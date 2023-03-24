import { Injectable } from '@angular/core';
import { AiDqnTrainStore } from './ai-dqn-train.store';
import { AiMinimaxingService } from '../../minimaxing/ai-minimaxing.service';
import { AiRandomService } from '../../random/ai-random.service';
import { GodType } from '../../../../state/player/player.model';
import { Move, MoveIndex } from '../../../../state/action/move.model';
import { WinnerValidatorService } from '../../../../validator/winner-validator.service';
import { AiService } from '../../ai.service';
import { AiTensorflowService } from '../ai-tensorflow.service';
import { DrawValidatorService } from '../../../../validator/draw-validator.service';
import { Rewards } from '../../rewards';
import { AiDqnService } from '../ai-dqn.service';
import { AiHistoryLoss } from './ai-dqn-train.model';
import { formatNumber } from '@angular/common';

@Injectable({providedIn: 'root'})
export class AiDqnTrainService {

  constructor(
    private aiDqnTrainStore: AiDqnTrainStore,
    private aiMinimaxingService: AiMinimaxingService,
    private aiRandomService: AiRandomService,
    private aiTensorflowService: AiTensorflowService,
    private drawValidatorService: DrawValidatorService
  ) {
  }

  init(totalEpisodes: number, startEpsilon: number): void {
    this.aiDqnTrainStore.update(
      {
        epsilon: startEpsilon,
        episode: 0,
        wins: 0,
        draws: 0,
        defeats: 0,
        winRate: 0,
        totalEpisodes,
        startEpsilon
      }
    );

    this.aiDqnTrainStore.setLoading(true);
  }

  prepare(): void {
    this.aiTensorflowService.prepare();
    this.drawValidatorService.reset();
  }

  getOpponentMove(state: number[][], isPlaying: GodType, botType: 'random' | 'minimax', isTraining: GodType): Move {
    switch (botType) {
      case 'random': {
        const moves: Move[] = AiService.getPossiblesMoves(state, isPlaying);

        // RANDOM is never killing himself improves learning to kill opponent
        const filteredMoves: Move[] = moves.filter(m => {
          const execution = AiService.executeMoveWithReward(state, m, isPlaying);

          if (execution.winner !== undefined && execution.winner !== isPlaying) {
            return false;
          }

          // check if trainer can win without doing something, if its so filter this move
          AiService.executeLight(execution.nextState, isTraining);
          const winner: GodType | undefined = WinnerValidatorService.checkWinnerWithGod(execution.nextState);

          if (winner !== undefined && winner === isPlaying) {
            return false;
          }

          return true;
        });

        if (filteredMoves.length > 0) {
          return filteredMoves[this.aiRandomService.generateRandomNumber(0, filteredMoves.length - 1)];
        }

        return moves[this.aiRandomService.generateRandomNumber(0, moves.length - 1)];

      }
      case 'minimax': {
        return this.aiMinimaxingService.getMove(state, isPlaying);
      }
    }
  }

  stop(): void {
    this.aiTensorflowService.cleanUp();
    this.aiDqnTrainStore.setLoading(false);
  }

  chooseAction(model: any, state: number[][], isTraining: GodType): MoveIndex {
    // exploitation vs exploration, if random is smaller than epsilon go for exploration
    const epsilon = this.aiDqnTrainStore.getValue().epsilon;
    const explore = this.aiRandomService.generateRandomNumber(0, 10) / 10; // between 0 & 1
    const availableMoveIndexList: MoveIndex[] = AiService.shuffle(AiService.getPossibleMoveIndexList(state, isTraining));

    if (explore < epsilon) {
      // take random move
      const randomAction = this.aiRandomService.generateRandomNumber(0, availableMoveIndexList.length - 1);
      return availableMoveIndexList[randomAction];
    } else {
      // take best move - action and q values must have the same length
      const qValues: number[] = this.aiTensorflowService.predictBitmap(model, state);
      return this.getQMaxAction(availableMoveIndexList, qValues);
    }
  }

  private getQMaxAction(availableMoveIndexList: MoveIndex[], qValues: number[]): MoveIndex {
    let qIndex: number = 0;
    let maxQValue: number = qValues[availableMoveIndexList[qIndex].index];
    let availableIndexList = [];

    for (let i = 0; i < availableMoveIndexList.length; i++) {
      const availableAction: MoveIndex = availableMoveIndexList[i];
      const qValue = qValues[availableAction.index];

      if (qValue >= maxQValue) {
        if (qValue > maxQValue) {
          availableIndexList = [];
        }

        qIndex = i;
        maxQValue = qValues[availableMoveIndexList[qIndex].index];
        availableIndexList.push(qIndex);
      }
    }

    const randomNumber = this.aiRandomService.generateRandomNumber(0, availableIndexList.length - 1);
    return availableMoveIndexList[availableIndexList[randomNumber]];
  }

  getQValueMaxFromStateWithPrediction(nextState: number[][], prediction: number[], isTraining: GodType): number {
    const availableMoveIndexList: MoveIndex[] = AiService.shuffle(AiService.getPossibleMoveIndexList(nextState, isTraining));

    if (availableMoveIndexList.length <= 0) {
      console.error(nextState);
      throw new Error('There should be some possible actions');
    }

    const moveIndex: MoveIndex = this.getQMaxAction(availableMoveIndexList, prediction);
    try {
      return prediction[moveIndex.index];
    } catch (e) {
      console.error(e);
      console.log(availableMoveIndexList);
      console.log(prediction);
      console.log(moveIndex);
    }

    return prediction[moveIndex.index];
  }

  executeActionWithReward(state: number[][], isTraining: GodType, move: Move, rounds: number): {
    reward: number, nextState: number[][], winner: GodType | undefined, draw: boolean
  } {

    // return reward if it's a win
    const executeMoveFromTrainer = AiService.executeMoveWithReward(state, move, isTraining);
    if (executeMoveFromTrainer.winner !== undefined) {
      return {
        ...executeMoveFromTrainer,
        draw: false,
        reward: executeMoveFromTrainer.reward
      };
    }

    // return reward if it's a draw
    const draw = this.drawValidatorService.checkDrawFromStates(executeMoveFromTrainer.nextState);
    if (draw) {
      return {
        ...executeMoveFromTrainer,
        draw: true,
        reward: Rewards.DRAW_DQN
      }
    }

    const opponentMove = this.getOpponentMove(
      executeMoveFromTrainer.nextState,
      isTraining === GodType.CAMAXTLI ? GodType.NANAHUATZIN : GodType.CAMAXTLI,
      AiDqnService.ALL_DQN_SETTINGS.opponent as any,
      isTraining
    );
    const executeMoveFromOpponent = AiService.executeMoveWithReward(
      executeMoveFromTrainer.nextState,
      opponentMove,
      isTraining === GodType.CAMAXTLI ? GodType.NANAHUATZIN : GodType.CAMAXTLI
    );

    // overwrite positive reward into a negative one for is training
    // opponent has won
    if (executeMoveFromOpponent.winner !== undefined) {
      return {
        ...executeMoveFromOpponent,
        draw: false,
        reward: -1 * executeMoveFromOpponent.reward
      };
    }

    // opponent made the draw
    const drawOpponent = this.drawValidatorService.checkDrawFromStates(executeMoveFromOpponent.nextState);
    if (drawOpponent) {
      return {
        ...executeMoveFromOpponent,
        draw: true,
        reward: Rewards.DRAW_DQN
      }
    }


    const trainerReward = executeMoveFromTrainer.reward;
    // keep only positive rewards from opponent
    const opponentReward = executeMoveFromOpponent.reward > 0 ? -1 * executeMoveFromOpponent.reward : 0;

    return {
      ...executeMoveFromOpponent,
      draw: false,
      reward: trainerReward + opponentReward + (rounds * Rewards.ROUND)
    };
  }


  setScore(winner: GodType | undefined, draw: boolean, isTraining: GodType): void {
    const trainState = this.aiDqnTrainStore.getValue();

    if (winner !== undefined) {
      if (winner == isTraining) {
        this.aiDqnTrainStore.update({
          ...trainState,
          wins: trainState.wins + 1,
          winRate: (trainState.wins + 1) / trainState.episode
        });
      } else {
        this.aiDqnTrainStore.update({
          ...trainState,
          defeats: trainState.defeats + 1,
          winRate: trainState.wins / trainState.episode
        });
      }
    } else if (draw) {
      this.aiDqnTrainStore.update({
        ...trainState,
        draws: trainState.draws + 1,
        winRate: trainState.wins / trainState.episode
      });
    } else {
      throw new Error("End of episode must be with a winner or a draw");
    }


  }

  increaseEpisode(): void {
    const trainState = this.aiDqnTrainStore.getValue();
    this.aiDqnTrainStore.update({
      ...trainState,
      episode: trainState.episode + 1
    });
  }

  addHistoryLoss(loss: number, length: number): void {
    const historyLosses = this.aiDqnTrainStore.lossHistory$.getValue();
    historyLosses.push({loss: Number(loss.toFixed(2)), steps: length});
    this.aiDqnTrainStore.lossHistory$.next(historyLosses);
  }

  downloadLoss(fileName: string): void {
    let blob = new Blob([JSON.stringify(this.aiDqnTrainStore.lossHistory$.getValue())], {type: 'application/json'});

    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}
