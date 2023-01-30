import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';

import { ThemeState, ThemeStore } from './theme.store';

@Injectable({ providedIn: 'root' })
export class ThemeQuery extends Query<ThemeState> {

  theme$ = this.select(store => store.theme);

  constructor(protected override store: ThemeStore) {
    super(store);
  }

}
