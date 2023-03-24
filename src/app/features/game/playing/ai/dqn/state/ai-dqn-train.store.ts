import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { BehaviorSubject } from 'rxjs';
import { AiHistoryLoss } from './ai-dqn-train.model';

export interface AiDqnTrainState {
  episode: number;
  totalEpisodes: number;
  wins: number;
  draws: number;
  defeats: number;
  winRate: number;
  epsilon: number;
  startEpsilon: number;
  sync: number;
}

export function createInitialState(): AiDqnTrainState {
  return {} as AiDqnTrainState;
}


@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'ai-dqn-train' })
export class AiDqnTrainStore extends Store<AiDqnTrainState> {

  lossHistory$ = new BehaviorSubject<AiHistoryLoss[]>([]);

  constructor() {
    super(createInitialState());
  }

}
