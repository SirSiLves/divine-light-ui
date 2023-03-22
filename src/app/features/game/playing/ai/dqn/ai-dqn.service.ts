import { Injectable } from '@angular/core';
import { GodType } from '../../../state/player/player.model';
import { Move } from '../../../state/action/move.model';
import { AiService } from '../ai.service';
import { AiDqn1Service } from './dqn-1/ai-dqn-1.service';
import { AiDqn2Service } from './dqn-2/ai-dqn-2.service';
import { AiDqn3Service } from './dqn-3/ai-dqn-3.service';
import { AiDqn4Service } from './dqn-4/ai-dqn-4.service';
import { AiDqn5Service } from './dqn-5/ai-dqn-5.service';


@Injectable({
  providedIn: 'root'
})
export class AiDqnService {

  // 1 - dqn
  // 2 - dqn with network per player
  // 3 - dqn with network per player and replay memory
  // 4 - dqn with network per player, replay memory and target dqn
  // 5 - dqn with network per player, replay memory, target dqn and double dqn
  private readonly EXTENSION_SETTING: 1 | 2 | 3 | 4 | 5 = 1;

  constructor(
    private aiDqn1Service: AiDqn1Service,
    private aiDqn2Service: AiDqn2Service,
    private aiDqn3Service: AiDqn3Service,
    private aiDqn4Service: AiDqn4Service,
    private aiDqn5Service: AiDqn5Service,
  ) {
  }

  getMove(matrix: number[][], isPlaying: GodType): Move {
    switch (this.EXTENSION_SETTING) {
      case 1:
        return this.getMove1(matrix, isPlaying);
      case 2:
        return this.getMove2(matrix, isPlaying);
      case 3:
        return this.getMove3(matrix, isPlaying);
      case 4:
        return this.getMove4(matrix, isPlaying);
      case 5:
        return this.getMove5(matrix, isPlaying);
      default:
        return this.getMove5(matrix, isPlaying);
    }
  }

  train(episodes: number, epsilonInput: number, isTraining: GodType): void {
    switch (this.EXTENSION_SETTING) {
      case 1:
        this.aiDqn1Service.train(episodes, epsilonInput, isTraining);
        break;
      case 2:
        this.aiDqn2Service.train(episodes, epsilonInput, isTraining);
        break;
      case 3:
        this.aiDqn3Service.train(episodes, epsilonInput, isTraining);
        break;
      case 4:
        this.aiDqn4Service.train(episodes, epsilonInput, isTraining);
        break;
      case 5:
        this.aiDqn5Service.train(episodes, epsilonInput, isTraining);
        break;
    }
  }

  // dqn without any extensions
  getMove1(matrix: number[][], isPlaying: GodType): Move {
    return this.aiDqn1Service.getMove(matrix, isPlaying);
  }

  // dqn with network per player
  getMove2(matrix: number[][], isPlaying: GodType): Move {
    return this.aiDqn2Service.getMove(matrix, isPlaying);
  }

  // dqn with network per player and replay memory
  getMove3(matrix: number[][], isPlaying: GodType): Move {
    return this.aiDqn3Service.getMove(matrix, isPlaying);
  }

  // dqn with network per player, replay memory and target dqn
  getMove4(matrix: number[][], isPlaying: GodType): Move {
    return this.aiDqn4Service.getMove(matrix, isPlaying);
  }

  // dqn with network per player, replay memory, target dqn and double dqn
  getMove5(matrix: number[][], isPlaying: GodType): Move {
    return this.aiDqn5Service.getMove(matrix, isPlaying);
  }

}


