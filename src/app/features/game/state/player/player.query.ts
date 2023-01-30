import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { PlayerState, PlayerStore } from './player.store';
import { ColorMapping, GodType, Player } from './player.model';
import { BehaviorSubject, switchMap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class PlayerQuery extends QueryEntity<PlayerState> {

  defaultColor = {
    p1: {color: '#1d7a00', godType: GodType.CAMAXTLI},
    p2: {color: '#ffd600', godType: GodType.NANAHUATZIN}
  }

  colorMapping$ = new BehaviorSubject<ColorMapping>(this.defaultColor);

  isPlayingGod$ = new BehaviorSubject<GodType>(GodType.CAMAXTLI);

  player$ = (id: string) => this.selectEntity(id);

  winner$ = new BehaviorSubject<Player | undefined>(undefined);
  draw$ = new BehaviorSubject<boolean>(false);

  players$ = this.selectAll();

  constructor(protected override store: PlayerStore) {
    super(store);
  }

  isAllowTopPlay(piece: number): boolean {
    return piece < 100 && this.isPlayingGod$.value === GodType.CAMAXTLI
      || piece >= 100 && this.isPlayingGod$.value === GodType.NANAHUATZIN;
  }

  isPlaying(): Player {
    return this.isPlayingGod$.value === this.getPlayer1().godType ? this.getPlayer1() : this.getPlayer2();
  }

  getPlayer1(): Player {
    return this.getAll()[0];
  }

  getPlayer2(): Player {
    return this.getAll()[1];
  }

  isAIModeEnabled(): boolean {
    return this.getPlayer1().bot ? true : this.getPlayer2().bot;
  }


}
