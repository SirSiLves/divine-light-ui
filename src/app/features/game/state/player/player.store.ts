import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, guid, StoreConfig } from '@datorama/akita';
import { GodType, Player, PlayerType } from './player.model';

export interface PlayerState extends EntityState<Player>, ActiveState {
}

export function createInitialState(): PlayerState {
  return {} as PlayerState;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'player'})
export class PlayerStore extends EntityStore<PlayerState> {

  private readonly player1: Player = {
    id: guid(),
    name: 'Camaxtli',
    nick: 'Player',
    godType: GodType.CAMAXTLI,
    playerType: PlayerType.P1,
    bot: false,
    botType: undefined,
    wins: 0
  }

  private readonly player2: Player = {
    id: guid(),
    name: 'Nanahuatzin',
    nick: 'DQN',
    godType: GodType.NANAHUATZIN,
    playerType: PlayerType.P2,
    bot: true,
    botType: 'dqn',
    wins: 0
  }

  constructor() {
    super(createInitialState());

    this.upsertMany([
      this.player1,
      this.player2
    ]);
  }

}
