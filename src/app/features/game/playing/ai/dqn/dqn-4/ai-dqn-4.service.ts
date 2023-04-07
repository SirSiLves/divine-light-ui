import { Injectable } from '@angular/core';
import { GodType } from '../../../../state/player/player.model';
import { Move, MoveIndex } from '../../../../state/action/move.model';
import { AiService } from '../../ai.service';
import { AISarsd } from '../state/ai-dqn-train.model';
import { AiDqnTrainService } from '../state/ai-dqn-train.service';
import { AiDqnTrainQuery } from '../state/ai-dqn-train.query';
import { AiTensorflowService } from '../ai-tensorflow.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { MatrixQuery } from '../../../../state/matrix/matrix.query';
import { MatrixService } from '../../../../state/matrix/matrix.service';
import { ActionService } from '../../../../state/action/action.service';
import { AiDqnService } from '../ai-dqn.service';
import { environment } from '../../../../../../../environments/environment';
import { guid } from '@datorama/akita';


@Injectable({
  providedIn: 'root'
})
export class AiDqn4Service {

  public static readonly DQN_SETTINGS = {
    files: {
      camaxtli: {
        model: 'divine-light-dqn4-model-camaxtli_7x6',
        progress: 'divine-light-dqn4-progress-camaxtli_7x6',
        loss: 'divine-light-dqn4-loss-camaxtli_7x6'
      },
      nanahuatzin: {
        model: 'divine-light-dqn4-model-nanahuatzin_7x6',
        progress: 'divine-light-dqn4-progress-nanahuatzin_7x6',
        loss: 'divine-light-dqn4-loss-nanahuatzin_7x6'
      },
    },
  };

  // dqn model
  private onlineCamaxtli: any;
  private targetCamaxtli: any;
  private onlineNanahuatzin: any;
  private targetNanahuatzin: any;

  private replayMemory: AISarsd[] = [];
  private syncInterval: number = AiDqnService.ALL_DQN_SETTINGS.syncInterval;

  constructor(
    private aiDqnTrainService: AiDqnTrainService,
    private aiDqnTrainQuery: AiDqnTrainQuery,
    private aiTensorflowService: AiTensorflowService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private matrixQuery: MatrixQuery
  ) {
  }


  initializeModel(godType: GodType): void {
    // camaxtli
    if (godType === GodType.CAMAXTLI) {
      this.onlineCamaxtli = this.aiTensorflowService.createBitmapDQNModel()
      this.aiTensorflowService.compileDQNNetworks(this.onlineCamaxtli);
      this.targetCamaxtli = this.aiTensorflowService.createBitmapDQNModel();
      this.aiTensorflowService.compileDQNNetworks(this.targetCamaxtli);

      this.messageService.add({
        severity: 'info',
        detail: this.translateService.instant('core.settings.dqn.camaxtli.create')
      });
    }
    // nanahuatzin
    else {
      this.onlineNanahuatzin = this.aiTensorflowService.createBitmapDQNModel()
      this.aiTensorflowService.compileDQNNetworks(this.onlineNanahuatzin);
      this.targetNanahuatzin = this.aiTensorflowService.createBitmapDQNModel()
      this.aiTensorflowService.compileDQNNetworks(this.targetNanahuatzin);

      this.messageService.add({
        severity: 'info',
        detail: this.translateService.instant('core.settings.dqn.nanahuatzin.create')
      });
    }
  }

  getMove(matrix: number[][], isPlaying: GodType): Move {
    // dqn has been trained not with swapped positions
    const isSwappedPosition = MatrixQuery.isSwappedMatrixPosition(matrix);
    const normalizedMatrix = isSwappedPosition ? MatrixService.swapMatrix(matrix) : matrix;

    const qMaxAction: MoveIndex = this.aiDqnTrainService.getBestAction(
      isPlaying === GodType.CAMAXTLI ? this.onlineCamaxtli : this.onlineNanahuatzin, normalizedMatrix, isPlaying
    );

    return isSwappedPosition ? ActionService.swapMove(qMaxAction.move)! : qMaxAction.move;
  }

  train(totalEpisodes: number, startEpsilon: number, isTraining: GodType, startSteps: number): void {
    this.aiDqnTrainService.init(totalEpisodes, startEpsilon, startSteps);

    // give ui some time to deactivate buttons
    setTimeout(() => {
      this.prepare(isTraining);
    });
  }

  private prepare(isTraining: GodType): void {
    this.aiDqnTrainService.prepare();

    const defaultMatrix: number[][] = this.matrixQuery.getDefaultMatrix();
    if (isTraining === GodType.CAMAXTLI) {
      let copiedState = MatrixService.copy(defaultMatrix);
      this.run(copiedState, GodType.CAMAXTLI, 0);
    }
    // opponent needs to move first
    else {
      const opponentMove = this.aiDqnTrainService.getOpponentMove(
        defaultMatrix, GodType.CAMAXTLI, AiDqnService.ALL_DQN_SETTINGS.opponent as any, GodType.NANAHUATZIN
      );
      let {nextState} = AiService.executeMoveWithReward(defaultMatrix, opponentMove, GodType.CAMAXTLI);
      let copiedState = MatrixService.copy(nextState);
      this.run(copiedState, GodType.NANAHUATZIN, 0);
    }
  }

  loadModel(godType: GodType, modelFile: File, weightsFile: File): void {
    this.aiTensorflowService.loadModel(modelFile, weightsFile).then(response => {
      if (godType === GodType.CAMAXTLI) {
        this.onlineCamaxtli = response;
        this.targetCamaxtli = this.aiTensorflowService.createBitmapDQNModel();
        this.aiTensorflowService.compileDQNNetworks(this.onlineCamaxtli);
        this.aiTensorflowService.compileDQNNetworks(this.targetCamaxtli);
        this.aiTensorflowService.syncNetworkWeights(this.onlineCamaxtli, this.targetCamaxtli);

        if (environment.log) console.log('DQN Camaxtli-Model loaded');
      } else {
        this.onlineNanahuatzin = response;
        this.targetNanahuatzin = this.aiTensorflowService.createBitmapDQNModel();
        this.aiTensorflowService.compileDQNNetworks(this.onlineNanahuatzin);
        this.aiTensorflowService.compileDQNNetworks(this.targetNanahuatzin);
        this.aiTensorflowService.syncNetworkWeights(this.onlineNanahuatzin, this.targetNanahuatzin);

        if (environment.log) console.log('DQN Nanahuatzin-Model loaded');
      }
    });
  }

  getModel(godType: GodType): any {
    if (godType === GodType.CAMAXTLI) return this.onlineCamaxtli
    return this.onlineNanahuatzin;
  }

  private run(state: number[][], isTraining: GodType, rounds: number): void {
    const trainState = this.aiDqnTrainQuery.getValue();
    if (trainState.episode >= trainState.totalEpisodes) {
      this.aiDqnTrainService.stop();
      return;
    }

    // 1. take the possible action with the highest q-value or a random move
    const moveIndex: MoveIndex = this.chooseAction(state, isTraining);

    // 2. execute action && get reward from executed action
    const {reward, nextState, winner, draw} = this.aiDqnTrainService.executeActionWithReward(
      state, isTraining, moveIndex.move, rounds
    );

    // 3. collect entry into replay buffer
    const sars: AISarsd = {
      id: guid(), state, action: moveIndex, reward, nextState, done: winner !== undefined || draw, new: true
    };
    // 3.1 clear replay memory if buffer is full
    if (this.replayMemory.length >= AiDqnService.ALL_DQN_SETTINGS.bufferSize) this.replayMemory = [];
    // 3.2 write execution result into the replay buffer
    this.replayMemory.push(sars);

    // 4.1 check is buffer filled for training
    if (this.replayMemory.length >= AiDqnService.ALL_DQN_SETTINGS.replayStartSize) {

      // 5. train network
      this.fit(isTraining).then(() => {

        // 6. sync weights from online to target network
        this.syncNetworks(isTraining);

        // 7. go further until batch size is reached
        this.nextMove(isTraining, nextState, winner, rounds, draw, reward);
      });
    }
    // 4.2 go further until batch size is reached
    else {
      this.nextMove(isTraining, nextState, winner, rounds, draw, reward);
    }
  }

  private syncNetworks(isTraining: GodType) {
    if (this.syncInterval <= 0) {
      if (isTraining === GodType.CAMAXTLI) this.aiTensorflowService.syncNetworkWeights(this.onlineCamaxtli, this.targetCamaxtli);
      else this.aiTensorflowService.syncNetworkWeights(this.onlineNanahuatzin, this.targetNanahuatzin);
      this.syncInterval = AiDqnService.ALL_DQN_SETTINGS.syncInterval;
    } else {
      this.syncInterval -= 1;
    }
  }

  private chooseAction(state: number[][], isTraining: GodType): MoveIndex {
    if (isTraining === GodType.CAMAXTLI) return this.aiDqnTrainService.chooseAction(this.onlineCamaxtli, state, isTraining);
    return this.aiDqnTrainService.chooseAction(this.onlineNanahuatzin, state, isTraining);
  }

  private async fit(isTraining: GodType): Promise<void> {
    let miniBatchSamples = this.aiDqnTrainService.getMiniBatchSamplesFromReplayMemory(this.replayMemory);
    let stateList: number[][][][] = []; // samples, layers, 2d-matrix
    let nextStateList: number[][][][] = [];

    for (let i = 0; i < miniBatchSamples.length; i++) {
      const entry = miniBatchSamples[i];

      stateList.push(AiTensorflowService.getBitmap(entry.state));
      nextStateList.push(AiTensorflowService.getBitmap(entry.nextState));
    }

    const qValuesFromStates: number[][] = isTraining === GodType.CAMAXTLI ?
      this.aiTensorflowService.predictBitmapWithBatch(this.onlineCamaxtli, stateList) : this.aiTensorflowService.predictBitmapWithBatch(this.onlineNanahuatzin, stateList);
    const qValuesFromNextStates: number[][] = isTraining === GodType.CAMAXTLI ?
      this.aiTensorflowService.predictBitmapWithBatch(this.targetCamaxtli, nextStateList) : this.aiTensorflowService.predictBitmapWithBatch(this.targetNanahuatzin, nextStateList);

    for (let j = 0; j < miniBatchSamples.length; j++) {
      const entry = miniBatchSamples[j];
      let targetQ = entry.reward;
      if (!entry.done) {

        // DQN
        targetQ = (entry.reward + AiDqnService.ALL_DQN_SETTINGS.gamma * this.aiDqnTrainService.getQValueMaxFromStateWithPrediction(
            entry.nextState, qValuesFromNextStates[j], isTraining)
        );
      }

      this.aiDqnTrainService.validateQValue(targetQ);

      qValuesFromStates[j][entry.action.index] = targetQ;
    }

    const trainHistory = await this.aiTensorflowService.fitQValuesWithDatasetBitmap(
      isTraining === GodType.CAMAXTLI ? this.onlineCamaxtli : this.onlineNanahuatzin, stateList, qValuesFromStates
    );
    this.aiDqnTrainService.addHistoryLoss(trainHistory.history.loss[0], miniBatchSamples.length);
  }

  private nextMove(
    isTraining: GodType, nextState: number[][], winner: GodType | undefined, rounds: number, draw: boolean, reward: number
  ): void {
    if (winner !== undefined || draw) {
      this.aiDqnTrainService.calculateProgress(reward);
      this.nextEpisode(winner, isTraining, draw);
    } else {
      this.aiDqnTrainService.addProgress(reward);
      this.run(nextState, isTraining, rounds + 1);
    }
  }

  private nextEpisode(winner: GodType | undefined, isTraining: GodType, draw: boolean): void {
    this.aiDqnTrainService.increaseEpisode();
    this.aiDqnTrainService.decreaseEpsilon();
    this.aiDqnTrainService.setScore(winner, draw, isTraining);
    this.aiTensorflowService.cleanUp();

    setTimeout(() => {
      this.prepare(isTraining);
    });
  }

  downloadLoss(isTraining: GodType): void {
    const count = this.aiDqnTrainQuery.getValue().totalEpisodes;
    this.aiDqnTrainService.downloadLoss(isTraining === GodType.CAMAXTLI ?
      AiDqn4Service.DQN_SETTINGS.files.camaxtli.loss + '_' + count : AiDqn4Service.DQN_SETTINGS.files.nanahuatzin.loss + '_' + count
    );
  }

  downloadProgress(isTraining: GodType): void {
    const count = this.aiDqnTrainQuery.getValue().totalEpisodes;
    this.aiDqnTrainService.downloadProgress(isTraining === GodType.CAMAXTLI ?
      AiDqn4Service.DQN_SETTINGS.files.camaxtli.progress + '_' + count : AiDqn4Service.DQN_SETTINGS.files.nanahuatzin.progress + '_' + count
    );
  }

}
