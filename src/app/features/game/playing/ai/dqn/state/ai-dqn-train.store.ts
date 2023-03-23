import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface AiDqnTrainState {
  episodes: number;
  wins: number;
  draws: number;
  defeats: number;
  winRate: number;
  epsilon: number;
  sync: number;
}

export function createInitialState(): AiDqnTrainState {
  return {} as AiDqnTrainState;
}


@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'ai-dqn-train' })
export class AiDqnTrainStore extends Store<AiDqnTrainState> {

  constructor() {
    super(createInitialState());
  }

}
