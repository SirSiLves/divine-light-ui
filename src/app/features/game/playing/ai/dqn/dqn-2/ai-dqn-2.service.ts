import { Injectable } from '@angular/core';
import { GodType } from '../../../../state/player/player.model';
import { Move, MoveIndex } from '../../../../state/action/move.model';
import { AiService } from '../../ai.service';
import { AiDqnTrainService } from '../state/ai-dqn-train.service';
import { AiDqnTrainQuery } from '../state/ai-dqn-train.query';
import { AiTensorflowService } from '../ai-tensorflow.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { MatrixQuery } from '../../../../state/matrix/matrix.query';
import { MatrixService } from '../../../../state/matrix/matrix.service';
import { AiDqnService } from '../ai-dqn.service';
import { environment } from '../../../../../../../environments/environment';
import { AISarsd } from '../state/ai-dqn-train.model';
import { guid } from '@datorama/akita';
import { ActionService } from '../../../../state/action/action.service';

@Injectable({
  providedIn: 'root'
})
export class AiDqn2Service {

  public static readonly DQN_SETTINGS = {
    files: {
      camaxtli: {
        model: 'divine-light-dqn2-model-camaxtli_7x6',
        progress: 'divine-light-dqn2-progressl-camaxtli_7x6',
        loss: 'divine-light-dqn2-loss-camaxtli_7x6'
      },
      nanahuatzin: {
        model: 'divine-light-dqn2-model-nanahuatzin_7x6',
        progress: 'divine-light-dqn2-progress-nanahuatzin_7x6',
        loss: 'divine-light-dqn2-loss-nanahuatzin_7x6'
      },
    },
  };

  // dqn model
  private camaxtli: any;
  private nanahuatzin: any;

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
      this.camaxtli = this.aiTensorflowService.createBitmapDQNModel()
      this.aiTensorflowService.compileDQNNetworks(this.camaxtli);

      this.messageService.add({
        severity: 'info',
        detail: this.translateService.instant('core.settings.dqn.camaxtli.create')
      });
    }
    // nanahuatzin
    else {
      this.nanahuatzin = this.aiTensorflowService.createBitmapDQNModel()
      this.aiTensorflowService.compileDQNNetworks(this.nanahuatzin);

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
      isPlaying === GodType.CAMAXTLI ? this.camaxtli : this.nanahuatzin, normalizedMatrix, isPlaying
    );

    return isSwappedPosition ? ActionService.swapMove(qMaxAction.move)! : qMaxAction.move;
  }

  train(totalEpisodes: number, startEpsilon: number, isTraining: GodType): void {
    this.aiDqnTrainService.init(totalEpisodes, startEpsilon);

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
        this.camaxtli = response;
        this.aiTensorflowService.compileDQNNetworks(this.camaxtli);
        if (environment.log) console.log('DQN Camaxtli-Model loaded');
      } else {
        this.nanahuatzin = response;
        this.aiTensorflowService.compileDQNNetworks(this.nanahuatzin);
        if (environment.log) console.log('DQN Nanahuatzin-Model loaded');
      }
    });
  }

  getModel(godType: GodType): any {
    if (godType === GodType.CAMAXTLI) return this.camaxtli
    return this.nanahuatzin;
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

    // 3. train network with sars
    const sars: AISarsd[] = [{
      id: guid(), state, action: moveIndex, reward, nextState, done: winner !== undefined || draw, new: true
    }];
    this.fit(isTraining, sars).then(() => {
      // 4. go further until batch size is reached
      this.nextMove(isTraining, nextState, winner, rounds, draw, reward);
    });
  }

  private chooseAction(state: number[][], isTraining: GodType): MoveIndex {
    if (isTraining === GodType.CAMAXTLI) return this.aiDqnTrainService.chooseAction(this.camaxtli, state, isTraining);
    return this.aiDqnTrainService.chooseAction(this.nanahuatzin, state, isTraining);
  }

  private async fit(isTraining: GodType, entries: AISarsd[]): Promise<void> {
    let stateList: number[][][][] = []; // samples, layers, 2d-matrix
    let nextStateList: number[][][][] = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      stateList.push(AiTensorflowService.getBitmap(entry.state));
      nextStateList.push(AiTensorflowService.getBitmap(entry.nextState));
    }

    const qValuesFromStates: number[][] = isTraining === GodType.CAMAXTLI ?
      this.aiTensorflowService.predictBitmapWithBatch(this.camaxtli, stateList) : this.aiTensorflowService.predictBitmapWithBatch(this.nanahuatzin, stateList);
    const qValuesFromNextStates: number[][] = isTraining === GodType.CAMAXTLI ?
      this.aiTensorflowService.predictBitmapWithBatch(this.camaxtli, stateList) : this.aiTensorflowService.predictBitmapWithBatch(this.nanahuatzin, nextStateList);

    for (let j = 0; j < entries.length; j++) {
      const entry = entries[j];
      let targetQ = entry.reward;
      if (!entry.done) {

        // DQN
        targetQ = (entry.reward + AiDqnService.ALL_DQN_SETTINGS.gamma * this.aiDqnTrainService.getQValueMaxFromStateWithPrediction(
            entry.nextState, qValuesFromNextStates[j], isTraining)
        );
      }

      qValuesFromStates[j][entry.action.index] = targetQ;
    }

    const trainHistory = await this.aiTensorflowService.fitQValuesWithDatasetBitmap(
      isTraining === GodType.CAMAXTLI ? this.camaxtli : this.nanahuatzin, stateList, qValuesFromStates
    );
    this.aiDqnTrainService.addHistoryLoss(trainHistory.history.loss[0], entries.length);
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

    this.prepare(isTraining);
  }

  downloadLoss(isTraining: GodType): void {
    this.aiDqnTrainService.downloadLoss(isTraining === GodType.CAMAXTLI ?
      AiDqn2Service.DQN_SETTINGS.files.camaxtli.loss : AiDqn2Service.DQN_SETTINGS.files.nanahuatzin.loss
    );
  }


  downloadProgress(isTraining: GodType): void {
    this.aiDqnTrainService.downloadProgress(isTraining === GodType.CAMAXTLI ?
      AiDqn2Service.DQN_SETTINGS.files.camaxtli.progress : AiDqn2Service.DQN_SETTINGS.files.nanahuatzin.progress
    );
  }
}
