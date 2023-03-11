import { Injectable } from '@angular/core';
import { guid, Store, StoreConfig } from '@datorama/akita';
import { environment } from '../../../../environments/environment';
import { GameManagerSettings } from './game-manager-settings.model';

export interface GameManagerState {
  settings: GameManagerSettings;
}

export function createInitialState(): GameManagerState {
  return {} as GameManagerState;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'game-manager'})
export class GameManagerStore extends Store<GameManagerState> {

  constructor() {
    super(createInitialState());

    this.update({
      settings: {
        id: guid(),
        log: environment.log,
        displayCellIDs: environment.displayCellIDs,
        mode: 'p1vb', // p1vp2
        rematch: 'manual',
        autoSwitch: true
      }
    });


  }

}
