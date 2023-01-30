import { Move } from './move.model';
import { Destroy } from '../../light/light.model';
import { Player } from '../player/player.model';

// states before execution
export interface Action {
  id: string,
  player: Player
  move?: Move,
  destroy?: Destroy,
  matrix: {
    id: string
  }
}

export interface Pgn {
  id: string,
  pgn: string
}
