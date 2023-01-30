import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, guid, StoreConfig } from '@datorama/akita';
import { Action } from './action.model';

export interface ActionState extends EntityState<Action>, ActiveState {
}

export function createInitialState(): ActionState {
  return {} as ActionState;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'action', resettable: true})
export class ActionStore extends EntityStore<ActionState> {

  constructor() {
    super(createInitialState());
  }

  save(action: Action): void {
    const newID = guid();
    this.upsert(newID, action);
    this.setActive(newID);
  }

}
