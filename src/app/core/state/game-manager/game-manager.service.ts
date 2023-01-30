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


@Injectable({providedIn: 'root'})
export class GameManagerService {

  public static readonly GAME_SETTINGS = {
    draw: {
      repetition: 3, // if same position occurs for the 3rd time, is it a draw
      max: 500 // maximum rounds can be played
    }
  };

  constructor(
    private gameManagerStore: GameManagerStore,
    private matrixService: MatrixService,
    private matrixQuery: MatrixQuery,
    private actionService: ActionService,
    private playerService: PlayerService,
    private gameManagerQuery: GameManagerQuery,
    private playerQuery: PlayerQuery
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
    this.gameManagerQuery.reloading$.next(true);
    this.actionService.reset();
    this.matrixService.reset();
    this.playerService.resetWinner();
    this.playerService.resetDraw();
    this.playerService.resetGameToInitState();
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

  swapGods(): void {
    this.playerService.swapGods();
    this.matrixService.swapStates();
    this.actionService.swapActions();
  }

  save(): void {
    this.gameManagerStore.setLoading(true);
  }

  loadData(): void {
    this.gameManagerStore.setLoading(true);
  }

  public setLoading(loading: boolean): void {
    this.gameManagerStore.setLoading(loading);
  }


}
