import { Field } from '../state/action/field.model';
import { DirectionType } from './direction.model';

export interface Light {
  directionType: DirectionType,
  cellId: number,
  timer: number,
  last: boolean
}

export interface Destroy {
  position: Field
  piece: number
}

export interface Block {
  position: Field
  piece: number
}
