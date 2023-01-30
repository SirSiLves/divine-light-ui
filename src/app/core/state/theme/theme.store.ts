import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface ThemeState {
  theme: ThemeType;
}

export enum ThemeType {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export function createInitialState(): ThemeState {
  return {} as ThemeState;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'theme' })
export class ThemeStore extends Store<ThemeState> {

  constructor() {
    super(createInitialState());
  }

}
