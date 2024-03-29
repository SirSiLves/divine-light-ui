import { Injectable } from '@angular/core';
import { GameManagerStore } from './game-manager.store';
import { GameManagerQuery } from './game-manager.query';
import { PgnLoaderComponent } from '../../../features/game/settings/pgn-loader/pgn-loader.component';
import { MatrixService } from 'src/app/features/game/state/matrix/matrix.service';
import { PlayerService } from 'src/app/features/game/state/player/player.service';
import { ActionService } from 'src/app/features/game/state/action/action.service';
import { PlayerQuery } from '../../../features/game/state/player/player.query';
import { GodType } from '../../../features/game/state/player/player.model';
import { MatrixQuery } from '../../../features/game/state/matrix/matrix.query';
import { GameManagerSettings } from './game-manager-settings.model';
import { AiDqnService } from '../../../features/game/playing/ai/dqn/ai-dqn.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { HttpClient } from '@angular/common/http';
import { AiDqn1Service } from '../../../features/game/playing/ai/dqn/dqn-1/ai-dqn-1.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AiDqn2Service } from '../../../features/game/playing/ai/dqn/dqn-2/ai-dqn-2.service';
import { AiDqn3Service } from '../../../features/game/playing/ai/dqn/dqn-3/ai-dqn-3.service';
import { AiDqn4Service } from '../../../features/game/playing/ai/dqn/dqn-4/ai-dqn-4.service';
import { AiDqn5Service } from '../../../features/game/playing/ai/dqn/dqn-5/ai-dqn-5.service';


@Injectable({providedIn: 'root'})
export class GameManagerService {

  public static readonly GAME_SETTINGS = {
    draw: {
      repetition: 3, // if same position occurs for the 3rd time, is it a draw
      max: 500 // maximum rounds can be played
    }
  };

  public static readonly FIRE_STORE_DEFINITIONS = {
    poll: {
      name: 'poll'
    }
  };

  private isDQNCamaxtliModelLoading = true;
  private isDQNNanahuatzinModelLoading = true;

  constructor(
    private gameManagerStore: GameManagerStore,
    private matrixService: MatrixService,
    private matrixQuery: MatrixQuery,
    private actionService: ActionService,
    private playerService: PlayerService,
    private gameManagerQuery: GameManagerQuery,
    private playerQuery: PlayerQuery,
    private angularFirestore: AngularFirestore,
    private angularFireStorage: AngularFireStorage,
    private httpClient: HttpClient,
    private messageService: MessageService,
    private translateService: TranslateService,
    private aiDqnService: AiDqnService
  ) {
  }

  rematch(): void {
    const isSwappedMatrixPosition = MatrixQuery.isSwappedMatrixPosition(this.matrixQuery.getLatestMatrixState());
    const autoSwitch = this.gameManagerQuery.getValue().settings.autoSwitch;

    this.gameManagerQuery.reloading$.next(true);
    this.actionService.reset();
    this.matrixService.reset();

    // create reversed matrix
    if (isSwappedMatrixPosition && !autoSwitch) {
      this.matrixService.swapStates();
    } else if (autoSwitch) {
      if (this.playerQuery.colorMapping$.value.p1.godType === GodType.CAMAXTLI) this.matrixService.swapStates();
      this.playerService.swapGods();
    }

    this.gameManagerQuery.isRematch$.next();
    this.playerService.resetStarter();
    this.playerService.resetWinner();
    this.playerService.resetDraw();
    this.playerService.searchAndTriggerAIMove();
  }

  newGame(): void {
    const isSwappedMatrixPosition = MatrixQuery.isSwappedMatrixPosition(this.matrixQuery.getLatestMatrixState());

    this.gameManagerQuery.reloading$.next(true);
    this.actionService.reset();
    this.matrixService.reset();
    this.playerService.resetWinner();
    this.playerService.resetDraw();
    this.playerService.resetGameToInitState();

    if (isSwappedMatrixPosition) {
      this.swapStates();
    }
  }

  loadWithPGN(matrix: number[][], notation: string): void {
    this.gameManagerQuery.reloading$.next(true);
    this.actionService.reset();
    this.matrixService.reset();
    this.matrixService.loadMatrixFromPGN(matrix, notation);
    this.playerService.setWinnerAfterPGN(matrix);
    this.playerService.resetDraw();

    const isSwappedMatrixPosition = MatrixQuery.isSwappedMatrixPosition(matrix);
    const isLastBoardSwapped = this.playerQuery.colorMapping$.value.p1.godType === GodType.CAMAXTLI;
    if (isSwappedMatrixPosition && isLastBoardSwapped) {
      this.playerService.swapGods();
    }

    const playing: GodType = PgnLoaderComponent.getPlaying(notation);
    if (this.playerQuery.isPlayingGod$.value !== playing) {
      this.playerQuery.isPlayingGod$.next(playing);
    }
  }

  openSettings(): void {
    this.gameManagerQuery.settingsOpen$.next(true);
  }

  closeSettings(): void {
    this.gameManagerQuery.settingsOpen$.next(false);
  }

  updateMode(mode: string): void {
    const setting: GameManagerSettings = this.gameManagerQuery.getValue().settings;
    this.gameManagerStore.update({
      settings: {
        ...setting,
        mode: mode
      }
    });
  }

  updateAutoRematch(rematch: 'auto' | 'manual'): void {
    const setting: GameManagerSettings = this.gameManagerQuery.getValue().settings;
    this.gameManagerStore.update({
      settings: {
        ...setting,
        rematch
      }
    });
  }

  updateAutoSwitch(autoSwitch: boolean): void {
    const setting: GameManagerSettings = this.gameManagerQuery.getValue().settings;
    this.gameManagerStore.update({
      settings: {
        ...setting,
        autoSwitch
      }
    });
  }

  swapAll(): void {
    this.playerService.swapGods();
    this.matrixService.swapStates();
    this.actionService.swapActions();
  }

  swapStates(): void {
    this.matrixService.swapStates();
  }

  save(): void {
    this.setLoading(true);
  }

  loadData(): void {
    this.setLoading(true);
    this.loadDQNModels();
  }

  public setLoading(loading: boolean): void {
    this.gameManagerStore.setLoading(loading);
  }

  private stopLoading(): void {
    if (!this.isDQNCamaxtliModelLoading && !this.isDQNNanahuatzinModelLoading) {
      this.setLoading(false);
      this.playerService.searchAndTriggerAIMove();
    }
  }

  private loadDQNModels(): void {
    switch (AiDqnService.EXTENSION_SETTING) {
      case 1: {
        this.getCamaxtliModelFromCloud(AiDqn1Service.DQN_SETTINGS.files.camaxtli.model);
        this.getNanahuatzinModelFromCloud(AiDqn1Service.DQN_SETTINGS.files.nanahuatzin.model);
        break;
      }
      case 2: {
        this.getCamaxtliModelFromCloud(AiDqn2Service.DQN_SETTINGS.files.camaxtli.model);
        this.getNanahuatzinModelFromCloud(AiDqn2Service.DQN_SETTINGS.files.nanahuatzin.model);
        break;
      }
      case 3: {
        this.getCamaxtliModelFromCloud(AiDqn3Service.DQN_SETTINGS.files.camaxtli.model);
        this.getNanahuatzinModelFromCloud(AiDqn3Service.DQN_SETTINGS.files.nanahuatzin.model);
        break;
      }
      case 4: {
        this.getCamaxtliModelFromCloud(AiDqn4Service.DQN_SETTINGS.files.camaxtli.model);
        this.getNanahuatzinModelFromCloud(AiDqn4Service.DQN_SETTINGS.files.nanahuatzin.model);
        break;
      }
      case 5: {
        this.getCamaxtliModelFromCloud(AiDqn5Service.DQN_SETTINGS.files.camaxtli.model);
        this.getNanahuatzinModelFromCloud(AiDqn5Service.DQN_SETTINGS.files.nanahuatzin.model);
        break;
      }
    }
  }

  private getCamaxtliModelFromCloud(model: string): void {
    this.isDQNCamaxtliModelLoading = true;

    combineLatest([
      this.angularFireStorage.ref(model + '.json').getDownloadURL(),
      this.angularFireStorage.ref(model + '.weights.bin').getDownloadURL()
    ]).subscribe({
      next: ([urlModel, urlWeights]) => {

        combineLatest([
          this.httpClient.get(urlModel, {responseType: 'blob'}),
          this.httpClient.get(urlWeights, {responseType: 'blob'})
        ]).subscribe({
          next: async ([blobModel, blobWeights]) => {
            if (blobModel && blobWeights) {
              const modelFile = new File([blobModel], model + '.json');
              const weightsFile = new File([blobWeights], model + '.weights.bin');

              await this.aiDqnService.loadModel(GodType.CAMAXTLI, modelFile, weightsFile);

              this.isDQNCamaxtliModelLoading = false;
              this.stopLoading();
            }
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant('core.settings.dqn.camaxtli.error')
            });

            this.aiDqnService.initializeModel(GodType.CAMAXTLI);

            this.isDQNCamaxtliModelLoading = false;
            console.error(err);
          }
        })
      },
      error: err => {
        this.messageService.add({
          severity: 'error',
          detail: this.translateService.instant('core.settings.dqn.camaxtli.error')
        });

        this.aiDqnService.initializeModel(GodType.CAMAXTLI);

        this.isDQNCamaxtliModelLoading = false;
        this.stopLoading();
        console.error(err);
      }
    });
  }

  private getNanahuatzinModelFromCloud(model: string): void {
    this.isDQNNanahuatzinModelLoading = true;

    combineLatest([
      this.angularFireStorage.ref(model + '.json').getDownloadURL(),
      this.angularFireStorage.ref(model + '.weights.bin').getDownloadURL()
    ]).subscribe({
      next: ([urlModel, urlWeights]) => {

        combineLatest([
          this.httpClient.get(urlModel, {responseType: 'blob'}),
          this.httpClient.get(urlWeights, {responseType: 'blob'})
        ]).subscribe({
          next: async ([blobModel, blobWeights]) => {
            if (blobModel && blobWeights) {
              const modelFile = new File([blobModel], model + '.json');
              const weightsFile = new File([blobWeights], model + '.weights.bin');

              await this.aiDqnService.loadModel(GodType.NANAHUATZIN, modelFile, weightsFile);

              this.isDQNNanahuatzinModelLoading = false;
              this.stopLoading();
            }
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant('core.settings.dqn.nanahuatzin.error')
            });

            this.aiDqnService.initializeModel(GodType.NANAHUATZIN);

            // this.isDQNNanahuatzinModelLoading = false;
            console.error(err);
          }
        })
      },
      error: err => {
        this.messageService.add({
          severity: 'error',
          detail: this.translateService.instant('core.settings.dqn.nanahuatzin.error')
        });

        this.aiDqnService.initializeModel(GodType.NANAHUATZIN);

        // this.isDQNNanahuatzinModelLoading = false;
        this.stopLoading();
        console.error(err);
      }
    });
  }


}
