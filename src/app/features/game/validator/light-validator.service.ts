import { Injectable } from '@angular/core';
import { Field } from 'src/app/features/game/state/action/field.model';
import { GodType } from 'src/app/features/game/state/player/player.model';
import { Direction, DirectionType } from '../light/direction.model';
import { MoveValidatorService } from './move-validator.service';
import { PieceComponent } from '../board/piece/piece.component';
import { PieceType } from '../board/piece/piece';
import { MatrixStore } from '../state/matrix/matrix.store';

@Injectable({
  providedIn: 'root'
})
export class LightValidatorService {

  constructor() {
  }


  static getDestroyed(matrix: number[][], playing: GodType): Field | undefined {
    const startPosition: Field = playing === GodType.CAMAXTLI ? {
      x: (MatrixStore.WIDTH_NUMBER - 1),
      y: (MatrixStore.HEIGHT_NUMBER - 1)
    } : {x: 0, y: 0};

    const piece = matrix[startPosition.y][startPosition.x];
    // const direction: Direction = this.getDirection(piece);

    // console.log(direction);
    //
    // switch (direction) {
    //   case Direction.UP: {
    //
    //     break;
    //   }
    // }


    return undefined;
  }


  static getDirection(piece: number, directionType: DirectionType, position: Field): Direction {
    const pieceType: PieceType = PieceComponent.getType(piece);

    switch (pieceType) {
      case PieceType.SUN: {
        return {type: DirectionType.NONE, block: {piece, position: position}};
      }
      case PieceType.KING: {
        return {type: DirectionType.NONE, destroy: {piece, position: position}};
      }
      case PieceType.WALL: {
        return {type: DirectionType.NONE, destroy: {piece, position: position}};
      }
      case PieceType.REFLECTOR: {
        return this.getREFLECTORDirection(piece, directionType);
      }
      case PieceType.ANGLER: {
        return this.getANGLERDirection(piece, directionType, position);
      }
    }

    throw new Error('ERROR in LightValidatorService.getDirection(), could not found direction with piece value: ' + piece);
  }

  static getNextPosition(directionType: DirectionType, position: Field): Field | undefined {
    switch (directionType) {
      case DirectionType.NONE: {
        return undefined;
      }
      case DirectionType.UP: {
        return {
          x: position.x,
          y: position.y - 1
        };
      }
      case DirectionType.RIGHT: {
        return {
          x: position.x + 1,
          y: position.y
        };
      }
      case DirectionType.DOWN: {
        return {
          x: position.x,
          y: position.y + 1
        };
      }
      case DirectionType.LEFT: {
        return {
          x: position.x - 1,
          y: position.y
        };
      }
    }
  }


  static nextPositionAvailable(nextPosition: Field, matrix: number[][]): boolean {
    return nextPosition.y >= 0 && nextPosition.y < matrix.length &&
      nextPosition.x >= 0 && nextPosition.x < matrix[nextPosition.y].length
  }

  static getSUNDirection(piece: number): Direction {
    switch (MoveValidatorService.getRotation(piece)) {
      case 0:
        return {type: DirectionType.UP};
      case 1:
        return {type: DirectionType.RIGHT};
      case 2:
        return {type: DirectionType.DOWN}
      case 3:
        return {type: DirectionType.LEFT};
    }

    throw new Error('ERROR in LightValidatorService.getSUNDirection(), could not found sun direction with piece value: ' + piece);
  }

  private static getANGLERDirection(piece: number, directionType: DirectionType, position: Field): Direction {
    // direction how the light is going
    switch (MoveValidatorService.getRotation(piece)) {
      case 0: {
        if (directionType === DirectionType.UP) return {type: DirectionType.NONE, destroy: {piece, position}}
        if (directionType === DirectionType.RIGHT) return {type: DirectionType.NONE, destroy: {piece, position}};
        if (directionType === DirectionType.DOWN) return {type: DirectionType.RIGHT};
        if (directionType === DirectionType.LEFT) return {type: DirectionType.UP};
        break;
      }
      case 1: {
        if (directionType === DirectionType.UP) return {type: DirectionType.RIGHT};
        if (directionType === DirectionType.RIGHT) return {type: DirectionType.NONE, destroy: {piece, position}};
        if (directionType === DirectionType.DOWN) return {type: DirectionType.NONE, destroy: {piece, position}};
        if (directionType === DirectionType.LEFT) return {type: DirectionType.DOWN};
        break;
      }
      case 2: {
        if (directionType === DirectionType.UP) return {type: DirectionType.LEFT};
        if (directionType === DirectionType.RIGHT) return {type: DirectionType.DOWN};
        if (directionType === DirectionType.DOWN) return {type: DirectionType.NONE, destroy: {piece, position}};
        if (directionType === DirectionType.LEFT) return {type: DirectionType.NONE, destroy: {piece, position}};
        break;
      }
      case 3: {
        if (directionType === DirectionType.UP) return {type: DirectionType.NONE, destroy: {piece, position}}
        if (directionType === DirectionType.RIGHT) return {type: DirectionType.UP};
        if (directionType === DirectionType.DOWN) return {type: DirectionType.LEFT};
        if (directionType === DirectionType.LEFT) return {type: DirectionType.NONE, destroy: {piece, position}};
        break;
      }
    }

    throw new Error('ERROR in LightValidatorService.getANGLERDirection(), could not found sun direction with piece value: ' + piece);
  }

  private static getREFLECTORDirection(piece: number, directionType: DirectionType): Direction {
    // direction how the light is going
    switch (MoveValidatorService.getRotation(piece)) { // 0 or 1
      case 0: {
        if (directionType === DirectionType.UP) return {type: DirectionType.RIGHT}
        if (directionType === DirectionType.RIGHT) return {type: DirectionType.UP}
        if (directionType === DirectionType.DOWN) return {type: DirectionType.LEFT};
        if (directionType === DirectionType.LEFT) return {type: DirectionType.DOWN};
        break;
      }
      case 1: {
        if (directionType === DirectionType.UP) return {type: DirectionType.LEFT}
        if (directionType === DirectionType.RIGHT) return {type: DirectionType.DOWN}
        if (directionType === DirectionType.DOWN) return {type: DirectionType.RIGHT};
        if (directionType === DirectionType.LEFT) return {type: DirectionType.UP};
        break;
      }
    }

    throw new Error('ERROR in LightValidatorService.getREFLECTORDirection(), could not found sun direction with piece value: ' + piece);
  }
}
