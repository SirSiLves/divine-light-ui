import { Field } from './field.model';
import { GodType } from '../player/player.model';


export interface Move {
  type: MoveType,
  position: Field,
  piece: number,
  to?: Field
  toPiece?: number
}

export interface Walk extends Move {
  to: Field
}

export interface Rotation extends Move {
  toPiece: number
}

export enum MoveType {
  WALK,
  ROTATE
}

export interface PrepareMove {
  from: {
    x: number
    y: number
  },
  piece: number
}

export enum ActionSpace {
  W_UP_LEFT, W_UP_MID, W_UP_RIGHT,
  W_MID_RIGHT,
  W_DOWN_RIGHT, W_DOWN_MID, W_DOWN_LEFT,
  W_MID_LEFT,
  R_UP, R_RIGHT, R_DOWN, R_LEFT
}

export interface MoveIndex {
  index: number,
  move: Move
}



