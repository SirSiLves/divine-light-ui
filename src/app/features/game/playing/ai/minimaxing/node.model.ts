import { Move } from '../../../state/action/move.model';
import { GodType } from '../../../state/player/player.model';
import { Field } from '../../../state/action/field.model';

export interface ExecutedNode {
  state: number[][];
  move: Move;
  isPlaying: GodType;
  reward: number; // reward after executed move
  winner: GodType | undefined; // probably winner after executed move
  nextState: number[][]; // state after move is executed,
  depth: number;
  done: boolean
}

export interface PieceNode {
  state: number[][];
  piece: number
  position: Field,
  isPlaying: GodType;
  depth: number;
  move?: Move;
  reward?: number; // reward after executed move
  winner?: GodType | undefined; // probably winner after executed move
  nextState?: number[][]; // state after move is executed,
  done?: boolean
}
