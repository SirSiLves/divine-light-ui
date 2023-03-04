import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { GameManagerStore, GameManagerState } from './game-manager.store';
import { BehaviorSubject, map, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameManagerQuery extends Query<GameManagerState> {

  displayCellIDs$ = this.select().pipe(map(store => store?.settings.displayCellIDs));
  gameManager$ = this.select().pipe(map(store => store.settings));
  isLoading$ = this.selectLoading();
  isRematch$ = new Subject<void>();

  settingsOpen$ = new BehaviorSubject<boolean>(false);
  reloading$ = new BehaviorSubject<boolean>(true);
  polling$ = new BehaviorSubject<boolean>(false);

  constructor(protected override store: GameManagerStore) {
    super(store);
  }

}
