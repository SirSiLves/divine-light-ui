import { Injectable } from '@angular/core';
import { GodType } from '../../../../state/player/player.model';
import { Move } from '../../../../state/action/move.model';
import { AiService } from '../../ai.service';
import { AiDqnTrainService } from '../state/ai-dqn-train.service';
import { AiTensorflowService } from '../ai-tensorflow.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AiDqn1Service {

  public static readonly DQN_SETTINGS = {
    files: {
      camaxtli: 'divine-light-camaxtli-dqn1-model_7x6',
      nanahuatzin: 'divine-light-nanahuatzin-dqn1-model_7x6'
    },
  };

  // model
  private camaxtli: any;
  private nanahuatzin: any;

  constructor(
    private aiDqnTrainService: AiDqnTrainService,
    private aiTensorflowService: AiTensorflowService,
    private messageService: MessageService,
    private translateService: TranslateService
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
    const moves: Move[] = AiService.getPossiblesMoves(matrix, isPlaying);
    return moves[this.generateRandomNumber(0, moves.length - 1)];
  }

  generateRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  train(episodes: number, epsilon: number, isTraining: GodType): void {
    this.prepare(episodes, epsilon);
  }

  private prepare(episodes: number, epsilon: number): void {
    this.aiDqnTrainService.init(episodes, epsilon);
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

}
