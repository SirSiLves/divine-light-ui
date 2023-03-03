import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameManagerQuery } from '../../../core/state/game-manager/game-manager.query';
import { GameManagerService } from '../../../core/state/game-manager/game-manager.service';
import { of, Subject, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GodType, Player, PlayerType } from '../state/player/player.model';
import { PlayerService } from '../state/player/player.service';
import { PlayerQuery } from '../state/player/player.query';
import { ActionQuery } from '../state/action/action.query';
import { ActionService } from '../state/action/action.service';
import { MatrixQuery } from '../state/matrix/matrix.query';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthenticationService } from '../../../core/authentiction/authentication.service';
import { MatrixStore } from '../state/matrix/matrix.store';
import { environment } from '../../../../environments/environment';
import { AiService } from '../playing/ai/ai.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  user$ = this.authenticationService.user$;

  isLoading$ = this.gameManagerQuery.isLoading$;
  isReloading$ = this.gameManagerQuery.reloading$;
  isLoading = false;

  display: boolean = false;
  position: string = 'right';

  mode: 'p1vp2' | 'p1vb' | 'bvb' = 'p1vp2';
  unsavedMode: 'p1vp2' | 'p1vb' | 'bvb' = this.mode;

  godPlaying: Player = this.playerQuery.getPlayer1();
  unsavedGodPlaying: Player = this.godPlaying;

  createNew = false;

  autoSwitch = true;
  unsavedAutoSwitch = this.autoSwitch;

  rematchOptions = [
    {label: 'core.settings.rematchManual', value: 'manual'},
    {label: 'core.settings.rematchAuto', value: 'auto'},
  ];
  rematchSettings: 'auto' | 'manual' = this.rematchOptions[0].value as any;
  unsavedRematchSettings: 'auto' | 'manual' = this.rematchSettings;

  cloudOptions = [
    {label: 'core.settings.loadFromCloud', value: 'load'},
    {label: 'core.settings.saveToCloud', value: 'save'},
  ];
  cloudSettings?: any;

  notation: string | undefined;
  unsavedNotation: string | undefined;
  matrixFromPGN: number[][] | undefined;

  botTypeP1 = this.playerQuery.getPlayer1().botType;
  unsavedGBotTypeP1: 'random' | 'minimax' | 'mcts' | 'dqn' | 'custom' | undefined = this.botTypeP1;

  botTypeP2 = this.playerQuery.getPlayer2().botType;
  unsavedGBotTypeP2: 'random' | 'minimax' | 'mcts' | 'dqn' | 'custom' | undefined = this.botTypeP2;

  init = false;

  queryParams: {
    mode: 'p1vp2' | 'p1vb' | 'bvb',
    camaxtli: 'p1' | 'p2',
    nanahuatzin: 'p1' | 'p2',
    botTypeP1: 'random' | 'minimax' | 'mcts' | 'dqn' | 'custom' | undefined,
    botTypeP2: 'random' | 'minimax' | 'mcts' | 'dqn' | 'custom' | undefined,
    rematch: 'auto' | 'manual',
    autoSwitch: boolean,
  } = {
    mode: 'p1vb',
    camaxtli: 'p1',
    nanahuatzin: 'p2',
    botTypeP1: undefined,
    botTypeP2: 'random',
    rematch: 'manual',
    autoSwitch: true
  };

  constructor(
    private playerService: PlayerService,
    private playerQuery: PlayerQuery,
    private gameManagerQuery: GameManagerQuery,
    private gameManagerService: GameManagerService,
    private actionQuery: ActionQuery,
    private actionService: ActionService,
    private matrixQuery: MatrixQuery,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authenticationService: AuthenticationService
  ) {
  }

  ngOnInit(): void {
    this.validateImpossibleIndexList();

    this.gameManagerQuery.settingsOpen$.pipe(takeUntil(this.onDestroy$)).subscribe(state => this.display = state);
    this.gameManagerQuery.isLoading$.pipe(takeUntil(this.onDestroy$)).subscribe(isLoading => {
      if (isLoading) this.isLoading = isLoading;
    });

    this.playerQuery.player$(this.playerQuery.getPlayer1().id).pipe(takeUntil(this.onDestroy$)).subscribe(player => {
      if (player) {
        this.godPlaying = player;
        this.unsavedGodPlaying = player;
      }
    });

    this.actionQuery.isSwitching$.pipe(takeUntil(this.onDestroy$), switchMap(change => {
      if (change) return of(undefined);
      return this.matrixQuery.pgnActive$
    })).subscribe(pgn => {
      if (pgn) {
        this.notation = pgn;
        this.unsavedNotation = pgn;
      }
    });

    this.gameManagerQuery.isRematch$.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: () => {
        if (this.queryParams.camaxtli === 'p1') {
          this.queryParams.camaxtli = 'p2'
          this.queryParams.nanahuatzin = 'p1';
        } else {
          this.queryParams.camaxtli = 'p1'
          this.queryParams.nanahuatzin = 'p2';
        }

        this.setQueryParams();
      }
    });

    this.initQueryListener();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  private initQueryListener(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: params => {
        if (params['mode'] === undefined || params['rematch'] === undefined || params['autoSwitch'] === undefined
          || params['camaxtli'] === undefined || params['nanahuatzin'] === undefined ||
          (params['mode'] === 'bvb' && (params['botTypeP1'] === undefined || params['botTypeP2'] === undefined)) ||
          (params['mode'] === 'p1vb' && (params['botTypeP1'] === undefined && params['botTypeP2'] === undefined || (params['botTypeP1'] && params['botTypeP2']))) ||
          (params['mode'] === 'p1vp2' && (params['botTypeP1'] || params['botTypeP2']))
        ) {
          this.setQueryParams();
        } else {
          this.setSettings(params);
        }
      }
    });
  }

  openSettings(): void {
    this.gameManagerService.openSettings();
    this.actionService.resetPreparedMove();
  }

  close(save: boolean): void {
    if (save) {
      const setPGN = this.notation !== this.unsavedNotation;
      const setGod = this.godPlaying !== this.unsavedGodPlaying;
      const setMode = this.mode !== this.unsavedMode;
      const setP1Algorithm = this.botTypeP1 !== this.unsavedGBotTypeP1;
      const setP2Algorithm = this.botTypeP2 !== this.unsavedGBotTypeP2;
      const uploadSettings = this.cloudSettings === 'save';
      const downloadSettings = this.cloudSettings === 'load';
      const rematchSettings = this.rematchSettings !== this.unsavedRematchSettings;
      const autoSwitchSetting = this.autoSwitch !== this.unsavedAutoSwitch;

      if (this.createNew) {
        this.gameManagerService.newGame();
      }

      if (autoSwitchSetting) this.prepareAutoSwitch();
      if (setP1Algorithm) this.prepareP1Algorithm();
      if (setP2Algorithm) this.prepareP2Algorithm();
      if (setPGN) this.setPGN();
      if (setMode) this.prepareMode();
      if (setGod) this.prepareSetGod();
      if (uploadSettings) this.gameManagerService.save();
      if (downloadSettings) this.gameManagerService.loadData();
      if (rematchSettings) this.prepareRematch();

      this.setQueryParams();
    }

    this.createNew = false;
    this.cloudSettings = undefined;
    this.unsavedMode = this.mode;
    this.unsavedGBotTypeP1 = this.botTypeP1;
    this.unsavedGBotTypeP2 = this.botTypeP2;
    this.unsavedGodPlaying = this.godPlaying;
    this.unsavedAutoSwitch = this.autoSwitch;
    this.unsavedNotation = this.notation;
    this.unsavedRematchSettings = this.rematchSettings;

    this.gameManagerService.closeSettings();
    this.prepareForAI();
  }

  private setSettings(params: Params): void {
    if (params['mode'] !== this.mode) {
      this.unsavedMode = params['mode'];
      this.setMode();
    }
    if (params['botTypeP1'] && params['botTypeP1'] !== this.botTypeP1) {
      this.unsavedGBotTypeP1 = params['botTypeP1'];
      this.setP1Algorithm();
    } else if (params['botTypeP1'] === undefined) {
      this.playerService.disableBOT(PlayerType.P1);
    }
    if (params['botTypeP2'] && params['botTypeP2'] !== this.botTypeP2) {
      this.unsavedGBotTypeP2 = params['botTypeP2'];
      this.setP2Algorithm();
    } else if (params['botTypeP2'] === undefined) {
      this.playerService.disableBOT(PlayerType.P2);
    }
    if (params['rematch'] !== this.rematchSettings) {
      this.unsavedRematchSettings = params['rematch'];
      this.setRematch();
    }
    if (params['autoSwitch'] !== this.autoSwitch.toString()) {
      this.unsavedAutoSwitch = params['autoSwitch'];
      this.setAutoSwitch();
    }

    this.queryParams = {
      ...params as any
    }

    this.prepareForAI();
  }

  private setMode(): void {
    this.mode = this.unsavedMode;

    switch (this.mode) {
      case 'p1vp2': {
        this.playerService.disableBOT(PlayerType.P1);
        this.playerService.disableBOT(PlayerType.P2);
        break;
      }
      case 'p1vb': {
        this.playerService.disableBOT(PlayerType.P1);
        this.playerService.enableBOT(PlayerType.P2);
        break;
      }
      case 'bvb': {
        this.playerService.enableBOT(PlayerType.P1);
        this.playerService.enableBOT(PlayerType.P2);
        break;
      }
    }
    this.botTypeP1 = this.playerQuery.getPlayer1().botType;
    this.botTypeP2 = this.playerQuery.getPlayer2().botType;

    this.gameManagerService.updateMode(this.mode);
  }

  private setPGN(): void {
    this.notation = this.unsavedNotation;
    if (this.matrixFromPGN) {
      this.gameManagerService.loadWithPGN(this.matrixFromPGN, this.notation!);
      const isSwappedMatrixPosition = MatrixQuery.isSwappedMatrixPosition(this.matrixQuery.getLatestMatrixState());
      this.queryParams.camaxtli = isSwappedMatrixPosition ? 'p2' : 'p1';
      this.queryParams.nanahuatzin = isSwappedMatrixPosition ? 'p1' : 'p2';
    }
  }

  isSaveDisabled(): boolean {
    if (!this.hasUnsavedChanges() || this.actionQuery.isSwitching$.value) {
      return true;
    }

    if (this.notation != this.unsavedNotation && !this.matrixFromPGN) {
      return true;
    }

    return false;
  }

  hasUnsavedChanges = (): boolean => {
    return !(this.notation === this.unsavedNotation && this.mode === this.unsavedMode && !this.createNew &&
      this.godPlaying === this.unsavedGodPlaying &&
      this.botTypeP1 === this.unsavedGBotTypeP1 && this.botTypeP2 === this.unsavedGBotTypeP2 &&
      this.cloudSettings === undefined &&
      this.unsavedRematchSettings === this.rematchSettings &&
      this.unsavedAutoSwitch === this.autoSwitch);
  }

  private setP1Algorithm(): void {
    this.botTypeP1 = this.unsavedGBotTypeP1;
    this.playerService.setP1Algorithm(this.botTypeP1);
  }

  private setP2Algorithm(): void {
    this.botTypeP2 = this.unsavedGBotTypeP2;
    this.playerService.setP2Algorithm(this.botTypeP2);
  }

  private setRematch(): void {
    this.rematchSettings = this.unsavedRematchSettings;
    this.gameManagerService.updateAutoRematch(this.rematchSettings as ('auto' | 'manual'));
  }

  private setAutoSwitch(): void {
    this.autoSwitch = this.unsavedAutoSwitch;
    this.gameManagerService.updateAutoSwitch(this.autoSwitch);
  }

  private setQueryParams(): void {
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: this.queryParams
      }
    );
  }

  private prepareMode(): void {
    switch (this.unsavedMode) {
      case 'p1vp2': {
        this.queryParams.botTypeP1 = undefined;
        this.queryParams.botTypeP2 = undefined;
        this.queryParams.mode = this.unsavedMode;
        break;
      }
      case 'p1vb': {
        const isSwappedMatrixPosition = MatrixQuery.isSwappedMatrixPosition(this.matrixQuery.getLatestMatrixState());

        if (isSwappedMatrixPosition) {
          this.queryParams.botTypeP1 = this.godPlaying.godType === GodType.NANAHUATZIN ? undefined : this.unsavedGBotTypeP2;
          this.queryParams.botTypeP2 = this.godPlaying.godType === GodType.CAMAXTLI ? undefined : this.unsavedGBotTypeP2;
        } else {
          this.queryParams.botTypeP1 = this.godPlaying.godType === GodType.CAMAXTLI ? undefined : this.unsavedGBotTypeP2;
          this.queryParams.botTypeP2 = this.godPlaying.godType === GodType.NANAHUATZIN ? undefined : this.unsavedGBotTypeP2;
        }

        this.queryParams.mode = this.unsavedMode;
        break;
      }
      case 'bvb': {
        this.queryParams.botTypeP1 = this.unsavedGBotTypeP1;
        this.queryParams.botTypeP2 = this.unsavedGBotTypeP2;
        this.queryParams.mode = this.unsavedMode;
        break;
      }
    }
  }

  private prepareP1Algorithm(): void {
    this.queryParams.botTypeP1 = this.unsavedGBotTypeP1;
  }

  private prepareP2Algorithm(): void {
    this.queryParams.botTypeP2 = this.unsavedGBotTypeP2;
  }

  private prepareRematch(): void {
    this.queryParams.rematch = this.unsavedRematchSettings;
  }

  private prepareAutoSwitch(): void {
    this.queryParams.autoSwitch = this.unsavedAutoSwitch;
  }

  private prepareSetGod(): void {
    if (this.unsavedGodPlaying.godType === GodType.CAMAXTLI) {
      this.queryParams.camaxtli = this.unsavedGodPlaying.playerType === PlayerType.P1 ? 'p2' : 'p1';
      this.queryParams.nanahuatzin = this.unsavedGodPlaying.playerType === PlayerType.P1 ? 'p1' : 'p2';
    } else {
      this.queryParams.nanahuatzin = this.unsavedGodPlaying.playerType === PlayerType.P1 ? 'p2' : 'p1';
      this.queryParams.camaxtli = this.unsavedGodPlaying.playerType === PlayerType.P1 ? 'p1' : 'p2';
    }

    this.godPlaying = this.unsavedGodPlaying;
  }

  private prepareForAI(): void {
    setTimeout(() => {
      if (this.isLoading || this.isLoading === undefined) {
        this.prepareForAI();
      } else {
        this.playerService.searchAndTriggerAIMove();
      }
    }, 100);
  }

  private validateImpossibleIndexList(): void {
    const indexListToSkip = AiService.getIndexListToSkip(MatrixStore.WIDTH_NUMBER, MatrixStore.HEIGHT_NUMBER);
    if (environment.log) console.log('INDEX LIST to SKIP', indexListToSkip);

    indexListToSkip.forEach(index => {
      if (!MatrixStore.IMPOSSIBLE_INDEXES.includes(index)) {
        console.error('Missing number in the skip index list: ', index)
        throw Error("Impossible Index List is not completed");
      }
    });
  }
}
