import { Component, EventEmitter, Input, Output } from '@angular/core';
import { map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AiDqnTrainQuery } from '../../playing/ai/dqn/state/ai-dqn-train.query';
import { GameManagerService } from '../../../../core/state/game-manager/game-manager.service';
import { GodType } from '../../state/player/player.model';
import { AiDqnService } from '../../playing/ai/dqn/ai-dqn.service';
import { GameManagerQuery } from '../../../../core/state/game-manager/game-manager.query';


@Component({
  selector: 'app-dqn',
  templateUrl: './dqn.component.html',
  styleUrls: ['./dqn.component.scss']
})
export class DqnComponent {

  private onDestroy$ = new Subject<void>();

  @Input() extension!: 1 | 2 | 3 | 4 | 5
  @Output() extensionChange$ = new EventEmitter<1 | 2 | 3 | 4 | 5>();

  isTraining$ = this.aiDqnTrainQuery.isLoading$;
  settingsLoading = false;

  private train$ = this.aiDqnTrainQuery.select();
  episode$ = this.train$.pipe(map(data => data.episode));
  wins$ = this.train$.pipe(map(data => data.wins));
  draws$ = this.train$.pipe(map(data => data.draws));
  defeats$ = this.train$.pipe(map(data => data.defeats));
  epsilon$ = this.train$.pipe(map(data => data.epsilon));
  winRate$ = this.train$.pipe(map(data => data.winRate * 100));
  rewardAverage$ = this.train$.pipe(map(data => data.rewardAverage));

  godsOptions = [
    {label: 'Camaxtli', value: GodType.CAMAXTLI},
    {label: 'Nanahuatzin', value: GodType.NANAHUATZIN},
  ];
  isTraining: GodType = this.godsOptions[0].value;
  gods = GodType;

  totalEpisodes = AiDqnService.ALL_DQN_SETTINGS.episodes;
  startEpsilon = AiDqnService.ALL_DQN_SETTINGS.epsilon;
  startSteps = 0;

  constructor(
    private aiDqnTrainQuery: AiDqnTrainQuery,
    private gameManagerService: GameManagerService,
    private aiDqnService: AiDqnService,
    private gameManagerQuery: GameManagerQuery
  ) {
  }

  ngOnInit(): void {
    this.aiDqnTrainQuery.isLoading$.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: isLoading => this.gameManagerService.setLoading(isLoading)
    });

    this.gameManagerQuery.isLoading$.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: isLoading => this.settingsLoading = isLoading
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  train(): void {
    this.aiDqnService.train(this.totalEpisodes, this.startEpsilon, this.isTraining, this.startSteps);
  }

  downloadDQNModel(): void {
    this.aiDqnService.downloadDQNModel(this.isTraining);
  }

  downloadDQNLoss() {
    this.aiDqnService.downloadDQNLoss(this.isTraining);
  }

  downloadDQNProgress() {
    this.aiDqnService.downloadProgress(this.isTraining);
  }

  setExtension(): void {
    if (this.extension === AiDqnService.EXTENSION_SETTING) return;
    this.extensionChange$.next(this.extension);
  }
}
