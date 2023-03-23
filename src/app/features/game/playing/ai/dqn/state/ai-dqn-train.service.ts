import { Injectable } from '@angular/core';
import { AiDqnTrainStore } from './ai-dqn-train.store';

@Injectable({providedIn: 'root'})
export class AiDqnTrainService {

  constructor(
    private aiDqnTrainStore: AiDqnTrainStore
  ) {
  }


  init(episodes: number, epsilon: number): void {
    const trainState = this.aiDqnTrainStore.getValue();
    this.aiDqnTrainStore.update(
      {
        ...trainState,
        episodes,
        epsilon
      }
    );
  }
}
