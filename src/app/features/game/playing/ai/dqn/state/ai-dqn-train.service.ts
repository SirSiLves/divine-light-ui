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
import { AISarsd } from './ai-dqn-train.model';
import { environment } from '../../../../../../../environments/environment';
import { NotificationService } from '../../../../../../core/notification/notification.service';
import { AiHybridService } from '../../hybrid/ai-hybrid.service';


@Injectable({providedIn: 'root'})
export class AiDqnTrainService {

  // progress
  private tempRewardHistory: number[] = [];

  constructor(
    private aiDqnTrainStore: AiDqnTrainStore,
    private aiMinimaxingService: AiMinimaxingService,
    private aiRandomService: AiRandomService,
    private aiTensorflowService: AiTensorflowService,
    private drawValidatorService: DrawValidatorService,
    private aiHybridService: AiHybridService,
    private notificationService: NotificationService
  ) {
  }

  init(totalEpisodes: number, startEpsilon: number, startSteps: number): void {
    this.aiDqnTrainStore.setLoading(true);

    this.aiDqnTrainStore.update(
      {
        epsilon: startEpsilon,
        episode: startSteps,
        wins: 0,
        draws: 0,
        defeats: 0,
        winRate: 0,
        totalEpisodes: totalEpisodes + startSteps,
        startEpisodes: startSteps,
        startEpsilon
      }
    );

    this.aiDqnTrainStore.averageRewardHistory$.next([]);
    this.aiDqnTrainStore.lossHistory$.next([]);
  }

  prepare(): void {
    this.aiTensorflowService.prepare();
    this.drawValidatorService.reset();
  }

  getOpponentMove(
    state: number[][], isPlaying: GodType, botType: 'random' | 'minimax' | 'hybrid', isTraining: GodType, model: any
  ): Move {
    switch (botType) {
      case 'random': {
        return this.aiRandomService.getFilteredMove(state, isPlaying);
      }
      case 'minimax': {
        return this.aiMinimaxingService.getMove2(state, isPlaying);
      }
      case 'hybrid': {
        const bestDQNMove = this.getBestAction(model, state, isPlaying).move;
        return this.aiHybridService.getTrainingMove(state, isPlaying, bestDQNMove);
      }
    }
  }

  stop(version: string): void {
    this.notificationService.send('Training completed for ' + version);
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

  getBestAction(model: any, state: number[][], isTraining: GodType): MoveIndex {
    const availableMoveIndexList: MoveIndex[] = AiService.shuffle(AiService.getPossibleMoveIndexList(state, isTraining));
    const qValues: number[] = this.aiTensorflowService.predictBitmap(model, state);
    return this.getQMaxAction(availableMoveIndexList, qValues);
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

    return this.round(prediction[moveIndex.index]);
  }

  executeActionWithReward(
    state: number[][], isTraining: GodType, move: Move, rounds: number, model: any, opponent: 'random' | 'minimax' | 'hybrid'
  ): {
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
      opponent as any,
      isTraining,
      model
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
          winRate: (trainState.wins + 1) / (trainState.episode - trainState.startEpisodes)
        });
      } else {
        this.aiDqnTrainStore.update({
          ...trainState,
          defeats: trainState.defeats + 1,
          winRate: trainState.wins / (trainState.episode - trainState.startEpisodes)
        });
      }
    } else if (draw) {
      this.aiDqnTrainStore.update({
        ...trainState,
        draws: trainState.draws + 1,
        winRate: trainState.wins / (trainState.episode - trainState.startEpisodes)
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

  decreaseEpsilon(): void {
    const trainState = this.aiDqnTrainStore.getValue();
    const newEpsilon = Math.max(
      trainState.epsilon - AiDqnService.ALL_DQN_SETTINGS.epsilonDecay, 0.1
    );

    this.aiDqnTrainStore.update({
      ...trainState,
      epsilon: newEpsilon
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

  addProgress(reward: number): void {
    this.tempRewardHistory.push(reward);
  }

  calculateProgress(reward: number): void {
    this.tempRewardHistory.push(reward);
    let sum = 0;

    this.tempRewardHistory.forEach(reward => sum += reward);
    const average = sum / this.tempRewardHistory.length;

    const averageRewardHistory = this.aiDqnTrainStore.averageRewardHistory$.getValue();
    const trainState = this.aiDqnTrainStore.getValue();

    averageRewardHistory.push({reward: average, episode: trainState.episode});
    this.aiDqnTrainStore.averageRewardHistory$.next(averageRewardHistory);

    // update last average
    this.aiDqnTrainStore.update({
      ...trainState,
      rewardAverage: average
    });

    this.tempRewardHistory = [];
  }


  downloadProgress(fileName: string) {
    let blob = new Blob([JSON.stringify(this.aiDqnTrainStore.averageRewardHistory$.getValue())], {type: 'application/json'});

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

  getMiniBatchSamplesFromReplayMemory(replayMemory: AISarsd[]): AISarsd[] {
    const samples = [];

    // get new entries first and shuffle those
    const newestEntries = AiService.shuffle(replayMemory.filter(entry => entry.new));

    for (let i = 0; i < newestEntries.length; i++) {
      const newEntry = newestEntries[i];
      samples.push(newEntry);
      replayMemory.find(entry => entry.id === newEntry.id)!.new = false;

      if (samples.length < AiDqnService.ALL_DQN_SETTINGS.batchSize) break;
    }

    while (samples.length < AiDqnService.ALL_DQN_SETTINGS.batchSize) {
      const randomNumber = this.aiRandomService.generateRandomNumber(0, replayMemory.length - 1);
      samples.push(replayMemory[randomNumber]);
    }

    return samples;
  }

  validateQValue(targetQ: number): number {
    if (targetQ >= Rewards.WIN * 10 && environment.log) console.warn('Target Q-Value is really high ' + targetQ);
    return this.round(targetQ);
  }

  round(number: number): number {
    return +(Math.round(Number(number + "e+2")) + "e-2");
  }
}
