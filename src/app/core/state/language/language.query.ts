import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { LanguageStore, LanguageState } from './language.store';

@Injectable({ providedIn: 'root' })
export class LanguageQuery extends Query<LanguageState> {

  language$ = this.select(store => store.language);

  constructor(protected override store: LanguageStore) {
    super(store);
  }

}
