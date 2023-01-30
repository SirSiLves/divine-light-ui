import { Block, Destroy } from './light.model';

export interface Direction {
  type: DirectionType
  destroy?: Destroy
  block?: Block
}

export enum DirectionType {
  NONE, UP, RIGHT, DOWN, LEFT
}


