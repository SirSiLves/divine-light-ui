import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AiDqnTrainStore, AiDqnTrainState } from './ai-dqn-train.store';

@Injectable({providedIn: 'root'})
export class AiDqnTrainQuery extends Query<AiDqnTrainState> {

  isLoading$ = this.selectLoading();
  lossHistory$ = this.store.lossHistory$.asObservable();

  constructor(protected override store: AiDqnTrainStore) {
    super(store);
  }

}
