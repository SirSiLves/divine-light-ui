import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface LanguageState {
  language: LanguageType;
}

export enum LanguageType {
  de = 'de',
  en = 'en',
}

export function createInitialState(): LanguageState {
  return {} as LanguageState;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'language' })
export class LanguageStore extends Store<LanguageState> {

  constructor() {
    super(createInitialState());
  }

}
