import { Injectable } from '@angular/core';
import { GodType } from '../../../state/player/player.model';
import { Move } from '../../../state/action/move.model';
import { AiDqn1Service } from './dqn-1/ai-dqn-1.service';
import { AiDqn2Service } from './dqn-2/ai-dqn-2.service';
import { AiDqn3Service } from './dqn-3/ai-dqn-3.service';
import { AiDqn4Service } from './dqn-4/ai-dqn-4.service';
import { AiDqn5Service } from './dqn-5/ai-dqn-5.service';
import { MatrixStore } from '../../../state/matrix/matrix.store';


@Injectable({
  providedIn: 'root'
})
export class AiDqnService {

  // 1 - DQN
  // 2 - DQN with Epsilon-Greedy
  // 3 - DQN with Epsilon-Greedy and Experience Replay
  // 4 - DQN with Epsilon-Greedy, Experience Replay and Target DQN
  // 5 - DQN with Epsilon-Greedy, Experience Replay, Target DQN and Double DQN
  public static EXTENSION_SETTING: 1 | 2 | 3 | 4 | 5 = 3;

  public static readonly ALL_DQN_SETTINGS = {
    // q-learning hyperparameters
    alpha: 0.0001, // a-learning rate between 0 and 1
    gamma: 0.99, // y-discount factor between 0 and 1 - gammas should correspond to the size of observation space: you should use larger gammas (ie closer to 1) for big state spaces, and smaller gammas for smaller spaces.
    episodes: 100000,
    epsilon: 1,
    epsilonDecay: 0.00001, // go slightly for more exploitation instead of exploration
    epochs: 1, // the validation loss going to increase that means overfitting than reduce epochs
    batchSize: 32, // sample size
    replayStartSize: 10000, // minimum replay memory size
    bufferSize: 100000, // replay memory
    // network
    neuronsHiddenBitmap: 651, // sqrt(H * W * C * POSSIBLE ACTIONS) -> POSSIBLE: 420 -> 7 * 6 * 24 * 420 -> 651 (7x6)
    neuronsHiddenBitmapGrouped: 461, // sqrt(H * W * C * POSSIBLE ACTIONS) -> POSSIBLE: 420 -> 7 * 6 * 12 * 420 -> 461 (7x6)
    neuronsHiddenAlgebraBinary: 376, // sqrt(H * W * POSSIBLE ACTIONS) -> POSSIBLE: 420 -> 7 * 6 * 420 * 8 -> 358 (7x6)
    // game specific
    NUM_BOARD_WIDTH: MatrixStore.WIDTH_NUMBER,
    NUM_BOARD_HEIGHT: MatrixStore.HEIGHT_NUMBER,
    NUM_MOVES: MatrixStore.TOTAL_POSSIBLE_ACTIONS,
    opponent: 'random', // 'random' | 'minimax'
  };

  constructor(
    private aiDqn1Service: AiDqn1Service,
    private aiDqn2Service: AiDqn2Service,
    private aiDqn3Service: AiDqn3Service,
    private aiDqn4Service: AiDqn4Service,
    private aiDqn5Service: AiDqn5Service,
  ) {
  }

  getMove(matrix: number[][], isPlaying: GodType): Move {
    switch (AiDqnService.EXTENSION_SETTING) {
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

  train(totalEpisodes: number, startEpsilon: number, isTraining: GodType, startSteps: number): void {
    switch (AiDqnService.EXTENSION_SETTING) {
      case 1:
        this.aiDqn1Service.train(totalEpisodes, startEpsilon, isTraining, startSteps);
        break;
      case 2:
        this.aiDqn2Service.train(totalEpisodes, startEpsilon, isTraining, startSteps);
        break;
      case 3:
        this.aiDqn3Service.train(totalEpisodes, startEpsilon, isTraining, startSteps);
        break;
      case 4:
        this.aiDqn4Service.train(totalEpisodes, startEpsilon, isTraining, startSteps);
        break;
      case 5:
        this.aiDqn5Service.train(totalEpisodes, startEpsilon, isTraining, startSteps);
        break;
    }
  }

  // dqn without any extensions
  getMove1(matrix: number[][], isPlaying: GodType): Move {
    return this.aiDqn1Service.getMove(matrix, isPlaying);
  }

  // dqn with network per player
  getMove2(matrix: number[][], isPlaying: GodType): Move {
    return this.aiDqn2Service.getMove(matrix, isPlaying);
  }

  // dqn with network per player and replay memory
  getMove3(matrix: number[][], isPlaying: GodType): Move {
    return this.aiDqn3Service.getMove(matrix, isPlaying);
  }

  // dqn with network per player, replay memory and target dqn
  getMove4(matrix: number[][], isPlaying: GodType): Move {
    return this.aiDqn4Service.getMove(matrix, isPlaying);
  }

  // dqn with network per player, replay memory, target dqn and double dqn
  getMove5(matrix: number[][], isPlaying: GodType): Move {
    return this.aiDqn5Service.getMove(matrix, isPlaying);
  }

  initializeModel(godType: GodType) {
    switch (AiDqnService.EXTENSION_SETTING) {
      case 1: {
        this.aiDqn1Service.initializeModel(godType);
        break;
      }
      case 2: {
        this.aiDqn2Service.initializeModel(godType);
        break;
      }
      case 3: {
        this.aiDqn3Service.initializeModel(godType);
        break;
      }
    }
  }

  loadModel(godType: GodType, model: File, weights: File): void {
    switch (AiDqnService.EXTENSION_SETTING) {
      case 1: {
        this.aiDqn1Service.loadModel(godType, model, weights);
        break;
      }
      case 2: {
        this.aiDqn2Service.loadModel(godType, model, weights);
        break;
      }
      case 3: {
        this.aiDqn3Service.loadModel(godType, model, weights);
        break;
      }
    }
  }

  downloadDQNModel(godType: GodType): void {
    switch (AiDqnService.EXTENSION_SETTING) {
      case 1: {
        const model = this.aiDqn1Service.getModel(godType);
        model.save('downloads://' + (
          godType === GodType.CAMAXTLI ? AiDqn1Service.DQN_SETTINGS.files.camaxtli.model : AiDqn1Service.DQN_SETTINGS.files.nanahuatzin.model
        )); // https://www.tensorflow.org/js/guide/save_load
        break;
      }
      case 2: {
        const model = this.aiDqn2Service.getModel(godType);
        model.save('downloads://' + (
          godType === GodType.CAMAXTLI ? AiDqn2Service.DQN_SETTINGS.files.camaxtli.model : AiDqn2Service.DQN_SETTINGS.files.nanahuatzin.model
        )); // https://www.tensorflow.org/js/guide/save_load
        break;
      }
      case 3: {
        const model = this.aiDqn3Service.getModel(godType);
        model.save('downloads://' + (
          godType === GodType.CAMAXTLI ? AiDqn3Service.DQN_SETTINGS.files.camaxtli.model : AiDqn3Service.DQN_SETTINGS.files.nanahuatzin.model
        )); // https://www.tensorflow.org/js/guide/save_load
        break;
      }
    }
  }

  downloadDQNLoss(isTraining: GodType): void {
    switch (AiDqnService.EXTENSION_SETTING) {
      case 1:
        this.aiDqn1Service.downloadLoss(isTraining);
        break;
      case 2:
        this.aiDqn2Service.downloadLoss(isTraining);
        break;
      case 3:
        this.aiDqn3Service.downloadLoss(isTraining);
        break;
    }
  }

  downloadProgress(isTraining: GodType): void {
    switch (AiDqnService.EXTENSION_SETTING) {
      case 1:
        this.aiDqn1Service.downloadProgress(isTraining);
        break;
      case 2:
        this.aiDqn2Service.downloadProgress(isTraining);
        break;
      case 3:
        this.aiDqn3Service.downloadProgress(isTraining);
        break;
    }
  }
}


