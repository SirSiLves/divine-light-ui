import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameManagerService } from '../../../../core/state/game-manager/game-manager.service';
import { GameManagerQuery } from '../../../../core/state/game-manager/game-manager.query';
import { AiService } from '../../playing/ai/ai.service';
import { MatrixQuery } from '../../state/matrix/matrix.query';
import { BotTypes, GodType } from '../../state/player/player.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DrawValidatorService } from '../../validator/draw-validator.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss']
})
export class SimulationComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  camaxtliAlgorithmOptions = [
    {label: 'RANDOM', value: BotTypes.RANDOM},
    {label: 'MINIMAX', value: BotTypes.MINIMAX},
    {label: 'DQN', value: BotTypes.DQN},
  ];
  camaxtliAlgorithm: BotTypes = this.camaxtliAlgorithmOptions[0].value;
  camaxtliScore: number = 0;

  nanahuatzinAlgorithmOptions = [
    {label: 'RANDOM', value: BotTypes.RANDOM},
    {label: 'MINIMAX', value: BotTypes.MINIMAX},
    {label: 'DQN', value: BotTypes.DQN},
  ];
  nanahuatzinAlgorithm: BotTypes = this.nanahuatzinAlgorithmOptions[0].value;
  nanahuatzinScore: number = 0;

  episodeInput: number = 10;
  episode: number = 0;

  public isSimulationOnGoing = new BehaviorSubject<boolean | undefined>(undefined);


  constructor(
    private gameManagerService: GameManagerService,
    private gameManagerQuery: GameManagerQuery,
    private aiService: AiService,
    private matrixQuery: MatrixQuery,
    private drawValidatorService: DrawValidatorService
  ) {
  }

  ngOnInit(): void {
    this.isSimulationOnGoing.pipe(takeUntil(this.onDestroy$)).subscribe(train => {
      if (train === true) this.gameManagerService.setLoading(train);
      if (train === false) this.gameManagerService.setLoading(train);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  prepare(): void {
    this.isSimulationOnGoing.next(true);
    this.camaxtliScore = 0;
    this.nanahuatzinScore = 0;
    this.episode = 0;

    let matrix: number[][] = this.matrixQuery.getDefaultMatrix();
    this.drawValidatorService.reset();
    this.play(matrix, 0);
  }

  play(matrix: number[][], round: number): void {
    round += 1;

    if (this.episodeInput <= this.episode) {
      this.isSimulationOnGoing.next(false);
      return;
    }

    // camaxtli
    const camaxtliMove = this.aiService.getMove(matrix, GodType.CAMAXTLI, this.camaxtliAlgorithm);
    const camaxtliMoveExecution = AiService.executeMoveWithReward(matrix, camaxtliMove, GodType.CAMAXTLI);

    if (camaxtliMoveExecution.winner !== undefined) {
      if (camaxtliMoveExecution.winner === GodType.CAMAXTLI) {
        this.camaxtliScore += 1;
      } else {
        this.nanahuatzinScore += 1;
      }
      const init = this.reset(matrix, round);
      matrix = init.matrix;
      round = init.round;
    }
    // nanahuatzin
    else {
      matrix = camaxtliMoveExecution.nextState;

      const nanahuatzinMove = this.aiService.getMove(matrix, GodType.NANAHUATZIN, this.nanahuatzinAlgorithm);
      const nanahuatzinMoveExecution = AiService.executeMoveWithReward(matrix, nanahuatzinMove, GodType.NANAHUATZIN);

      if (nanahuatzinMoveExecution.winner !== undefined) {
        if (nanahuatzinMoveExecution.winner === GodType.CAMAXTLI) {
          this.camaxtliScore += 1;
        } else {
          this.nanahuatzinScore += 1;
        }

        const init = this.reset(matrix, round);
        matrix = init.matrix;
        round = init.round;

      } else {
        matrix = nanahuatzinMoveExecution.nextState;
      }
    }

    setTimeout(() => {
      const draw = this.drawValidatorService.checkDrawFromStates(matrix);

      if (draw) {
        if (environment.log) console.log('DRAW, repetition of position or to much rounds', round);
        this.camaxtliScore += 0.5;
        this.nanahuatzinScore += 0.5;

        const init = this.reset(matrix, round);
        matrix = init.matrix;
        round = init.round;
      }

      this.play(matrix, round);
    }, 0);
  }

  private reset(matrix: number[][], round: number) {
    matrix = this.matrixQuery.getDefaultMatrix();
    this.episode += 1;
    round = 0;
    this.drawValidatorService.reset();
    return {matrix, round};
  }
}
