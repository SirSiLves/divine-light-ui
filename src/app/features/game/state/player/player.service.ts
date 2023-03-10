import { Injectable } from '@angular/core';
import { PlayerStore } from './player.store';
import { ColorMapping, GodType, Player, PlayerType } from './player.model';
import { PlayerQuery } from './player.query';
import { MatrixQuery } from '../matrix/matrix.query';
import { MatrixService } from '../matrix/matrix.service';
import { ActionStore } from '../action/action.store';
import { ActionQuery } from '../action/action.query';
import { guid } from '@datorama/akita';
import { GameManagerQuery } from '../../../../core/state/game-manager/game-manager.query';
import { Move } from '../action/move.model';
import { environment } from '../../../../../environments/environment';
import { Destroy } from '../../light/light.model';
import { WinnerValidatorService } from '../../validator/winner-validator.service';
import { LightService } from '../../light/light.service';
import { AiService } from '../../playing/ai/ai.service';
import { DrawValidatorService } from '../../validator/draw-validator.service';


@Injectable({providedIn: 'root'})
export class PlayerService {

  playerSwitchTimeout = 0;

  constructor(
    private playerStore: PlayerStore,
    private playerQuery: PlayerQuery,
    private winnerValidatorService: WinnerValidatorService,
    private matrixQuery: MatrixQuery,
    private lightService: LightService,
    private matrixService: MatrixService,
    private aiService: AiService,
    private actionStore: ActionStore,
    private actionQuery: ActionQuery,
    private gameManagerQuery: GameManagerQuery,
    private drawValidatorService: DrawValidatorService
  ) {
  }

  switchPlayer(move: Move): void {
    if (this.actionQuery.isSwitching$.value) return;
    this.actionQuery.isSwitching$.next(true);

    // disable history if it's on
    if (this.actionQuery.isHistory$.value) this.actionQuery.isHistory$.next(false);

    // execute move
    this.matrixService.updateMoveOnMatrix(move, this.playerQuery.isPlayingGod$.value);

    // turn on light
    const destroy: Destroy | undefined = this.lightService.turnOnLight(move.piece);
    this.playerSwitchTimeout = this.lightService.lightTime$.value + this.lightService.timeout;

    const matrix: number[][] = MatrixService.copy(this.matrixQuery.getLatestMatrixState());
    if (destroy) {
      matrix[destroy.position.y][destroy.position.x] = 0;
      this.actionQuery.destroyed$.next(destroy);
    }

    const winner: GodType | undefined = WinnerValidatorService.checkWinnerWithGod(matrix);
    const winnerWithPlayer: Player | undefined = winner !== undefined ?
      this.playerQuery.getPlayer1().godType === winner ? this.playerQuery.getPlayer1() : this.playerQuery.getPlayer2() : undefined;

    const draw: boolean = this.drawValidatorService.checkDrawFromStates(matrix);

    // show last fields
    this.actionStore.save({
      id: guid(),
      player: this.playerQuery.isPlaying(),
      move: this.actionQuery.lastMove$.value,
      destroy: destroy,
      matrix: {id: this.matrixQuery.getActiveMatrix().id}
    });
    if (environment.log) console.log('actions: ', this.actionQuery.getAll());

    // call back after light is off
    setTimeout(() => {
      this.lightService.turnOffLight();

      // disable history-mode if it's on
      if (this.actionQuery.isHistory$.value) this.actionQuery.isHistory$.next(false);

      if (destroy) this.matrixService.updateDestroyOnMatrix(destroy, this.playerQuery.isPlayingGod$.value);

      if (winnerWithPlayer) this.setWinner(winnerWithPlayer);
      else if (draw) this.setDraw();
      else {
        if (this.playerQuery.isPlaying().godType === GodType.CAMAXTLI) {
          this.playerQuery.isPlayingGod$.next(GodType.NANAHUATZIN);
        } else {
          this.playerQuery.isPlayingGod$.next(GodType.CAMAXTLI);
        }
      }

      this.actionQuery.isSwitching$.next(false);
      if (!winnerWithPlayer && this.playerQuery.isPlaying().bot && !draw) {
        this.triggerAIMove();
      }

    }, this.playerSwitchTimeout + 1000); // light timeout is defined
  }

  enableBOT(playerType: PlayerType): void {
    const player = playerType === PlayerType.P1 ? this.playerQuery.getPlayer1() : this.playerQuery.getPlayer2();

    this.playerStore.update(player.id, {
      ...player,
      nick: player.botType?.toUpperCase(),
      bot: true
    });
  }

  disableBOT(playerType: PlayerType): void {
    const player = playerType === PlayerType.P1 ? this.playerQuery.getPlayer1() : this.playerQuery.getPlayer2();

    this.playerStore.update(player.id, {
      ...player,
      nick: 'Player',
      bot: false,
      botType: undefined
    });
  }

  resetWinner(): void {
    this.playerQuery.winner$.next(undefined);
  }

  switchColor(): void {
    const p1 = this.playerQuery.colorMapping$.value.p1;
    const p2 = this.playerQuery.colorMapping$.value.p2;

    const switchMapping: ColorMapping = {
      p1: p2,
      p2: p1
    };

    this.playerQuery.colorMapping$.next(switchMapping);
  }

  switchGodsOnPlayer(): void {
    const player1 = this.playerQuery.getPlayer1();
    const player2 = this.playerQuery.getPlayer2();

    const updatedP1 = {
      ...player1,
      name: player2.name,
      godType: player2.godType
    };

    const updatedP2 = {
      ...player2,
      name: player1.name,
      godType: player1.godType
    }

    this.playerStore.update(player1.id, updatedP1);
    this.playerStore.update(player2.id, updatedP2);
  }

  searchAndTriggerAIMove(): void {
    if (!this.playerQuery.isPlaying().bot || this.aiService.aiTriggered || this.actionQuery.isSwitching$.value) return;

    const matrix: number[][] = MatrixService.copy(this.matrixQuery.getLatestMatrixState());
    const winner: Player | undefined = WinnerValidatorService.checkWinnerWithPlayer(matrix, this.playerQuery.getPlayer1(), this.playerQuery.getPlayer2());
    const draw: boolean = winner === undefined ? this.drawValidatorService.checkDrawFromStates(matrix) : true;

    if (!winner && !draw) {
      this.triggerAIMove();
    }
  }

  triggerAIMove() {
    this.aiService.aiTriggered = true;

    if (this.gameManagerQuery.reloading$.value || this.gameManagerQuery.settingsOpen$.value) {
      setTimeout(() => {
        // call recursive until animation or settings is closed
        if (this.playerQuery.isPlaying().bot) {
          this.triggerAIMove();
        } else {
          this.aiService.aiTriggered = false;
        }
      }, 1000);

    } else {
      setTimeout(() => {
        const matrix: number[][] = MatrixService.copy(this.matrixQuery.getLatestMatrixState());
        const winner: Player | undefined = WinnerValidatorService.checkWinnerWithPlayer(matrix, this.playerQuery.getPlayer1(), this.playerQuery.getPlayer2());

        const nextAIMove: Move | undefined = winner === undefined ? this.aiService.getMoveCurrentPlayer(matrix) : undefined;

        if (nextAIMove) {
          this.actionQuery.lastMove$.next(nextAIMove);
          this.switchPlayer(nextAIMove);
        }

        this.aiService.aiTriggered = false;

      }, this.aiService.timeout);
    }
  }

  resetGameToInitState(): void {
    const player1 = this.playerQuery.getPlayer1();
    const player2 = this.playerQuery.getPlayer2();

    this.playerStore.update(player1.id, {
      ...player1,
      wins: 0
    });

    this.playerStore.update(player2.id, {
      ...player2,
      wins: 0
    });

    this.resetStarter();

    this.searchAndTriggerAIMove();
  }

  private setWinner(winner: Player): void {

    this.playerStore.update(winner.id, {
      ...winner,
      wins: winner.wins + 1
    });

    this.playerQuery.winner$.next(winner);
  }

  setWinnerAfterPGN(matrix: number[][]): void {
    const winner: Player | undefined = WinnerValidatorService.checkWinnerWithPlayer(matrix, this.playerQuery.getPlayer1(), this.playerQuery.getPlayer2());

    if (winner) {
      this.setWinner(winner)
    } else {
      this.resetWinner();
    }
  }

  swapGods(): void {
    this.switchGodsOnPlayer();
    this.switchColor();
  }

  resetStarter(): void {
    this.playerQuery.isPlayingGod$.next(GodType.CAMAXTLI);
  }

  setP1Algorithm(algorithm: 'random' | 'minimax' | 'dqn' | undefined): void {
    const player = this.playerQuery.getPlayer1();

    this.playerStore.update(player.id, {
      ...player,
      botType: algorithm,
      nick: algorithm?.toUpperCase()
    });
  }

  setP2Algorithm(algorithm: 'random' | 'minimax' | 'dqn' | undefined): void {
    const player = this.playerQuery.getPlayer2();

    this.playerStore.update(player.id, {
      ...player,
      botType: algorithm,
      nick: algorithm?.toUpperCase()
    });
  }

  resetDraw(): void {
    this.drawValidatorService.reset();
    this.playerQuery.draw$.next(false);
  }

  private setDraw(): void {
    this.playerQuery.draw$.next(true);
    const player1 = this.playerQuery.getPlayer1();
    const player2 = this.playerQuery.getPlayer2();

    this.playerStore.update(player1.id, {
      ...player1,
      wins: player1.wins + 0.5
    });

    this.playerStore.update(player2.id, {
      ...player2,
      wins: player2.wins + 0.5
    });
  }
}
