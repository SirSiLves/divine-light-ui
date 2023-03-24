import { MoveIndex } from '../../../../state/action/move.model';

export interface AiSarsd {
  id: string;
  state: number[][];
  action: MoveIndex;
  reward: number;
  nextState: number[][];
  done: boolean;
  new: boolean;
}
