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

  private isOneModelLoading = false;
  private isPlayerModelsLoading = false;

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
    this.loadModel();
  }

  public setLoading(loading: boolean): void {
    this.gameManagerStore.setLoading(loading);
  }

  private stopLoading(): void {
    if (!this.isOneModelLoading && !this.isPlayerModelsLoading) {
      this.setLoading(false);
    }
  }

  private loadModel(): void {
    switch (AiDqnService.EXTENSION_SETTING) {
      case 1: {
        this.loadOneModel(AiDqn1Service.DQN_SETTINGS.model);
        break;
      }
    }
  }

  private loadOneModel(model: string): void {
    this.isOneModelLoading = true;

    combineLatest([
      this.angularFireStorage.ref(model + '.json').getDownloadURL(),
      this.angularFireStorage.ref(model + '.bin').getDownloadURL()
    ]).subscribe({
      next: ([urlModel, urlWeights]) => {

        combineLatest([
          this.httpClient.get(urlModel, {responseType: 'blob'}),
          this.httpClient.get(urlWeights, {responseType: 'blob'})
        ]).subscribe({
          next: ([blobModel, blobWeights]) => {
            if (blobModel && blobWeights) {
              const modelFile = new File([blobModel], model + '.json');
              const weightsFile = new File([blobWeights], model + '.bin');

              this.aiDqnService.loadModel(modelFile, weightsFile);
              this.isOneModelLoading = false;
              this.stopLoading();
            }
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant('core.settings.dqn.error')
            });

            this.aiDqnService.initializeModel();

            this.isOneModelLoading = false;
            console.error(err);
          }
        })
      },
      error: err => {
        this.messageService.add({
          severity: 'error',
          detail: this.translateService.instant('core.settings.dqn.error')
        });

        this.aiDqnService.initializeModel();

        this.isOneModelLoading = false;
        this.stopLoading();
        console.error(err);
      }
    });
  }

  private loadPlayerModels(): void {
    // TODO
    this.isPlayerModelsLoading = true;

    this.isPlayerModelsLoading = false;
    this.stopLoading();
  }


}
