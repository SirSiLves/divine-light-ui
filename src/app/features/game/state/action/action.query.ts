import { EventEmitter, Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ActionStore, ActionState } from './action.store';
import { BehaviorSubject } from 'rxjs';
import { Move, PrepareMove, Rotation, Walk } from './move.model';
import { Destroy } from '../../light/light.model';

@Injectable({providedIn: 'root'})
export class ActionQuery extends QueryEntity<ActionState> {

  isSwitching$ = new BehaviorSubject<boolean>(false);
  isHistory$ = new BehaviorSubject<boolean >(false);

  preparedMove$ = new BehaviorSubject<PrepareMove | undefined>(undefined);
  lastMove$ = new BehaviorSubject<Move | undefined>(undefined);
  possibleWalks$ = new BehaviorSubject<Walk[] | undefined>(undefined);
  possibleRotations$ = new BehaviorSubject<Rotation[] | undefined>(undefined);
  destroyed$ = new BehaviorSubject<Destroy | undefined>(undefined);

  reset$ = new EventEmitter<boolean>();

  constructor(protected override store: ActionStore) {
    super(store);
  }

}
