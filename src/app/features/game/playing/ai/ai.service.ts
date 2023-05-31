import { Injectable } from '@angular/core';
import { AiRandomService } from './random/ai-random.service';
import { ActionSpace, Move, MoveIndex, MoveType, Rotation, Walk } from '../../state/action/move.model';
import { PlayerQuery } from '../../state/player/player.query';
import { BotTypes, GodType } from '../../state/player/player.model';
import { Field } from '../../state/action/field.model';
import { PieceComponent } from '../../board/piece/piece.component';
import { PieceType } from '../../board/piece/piece';
import { MoveValidatorService } from '../../validator/move-validator.service';
import { AiMinimaxingService } from './minimaxing/ai-minimaxing.service';
import { MatrixService } from '../../state/matrix/matrix.service';
import { WinnerValidatorService } from '../../validator/winner-validator.service';
import { Direction } from '../../light/direction.model';
import { LightValidatorService } from '../../validator/light-validator.service';
import { Rewards } from './rewards';
import { MatrixStore } from '../../state/matrix/matrix.store';
import { AiDqnService } from './dqn/ai-dqn.service';
import { MatrixQuery } from '../../state/matrix/matrix.query';
import { AiDqn1Service } from './dqn/dqn-1/ai-dqn-1.service';
import { AiDqn2Service } from './dqn/dqn-2/ai-dqn-2.service';
import { AiDqn3Service } from './dqn/dqn-3/ai-dqn-3.service';
import { AiDqn4Service } from './dqn/dqn-4/ai-dqn-4.service';
import { AiDqn5Service } from './dqn/dqn-5/ai-dqn-5.service';
import { AiHybridService } from './hybrid/ai-hybrid.service';


@Injectable({
  providedIn: 'root'
})
export class AiService {

  // decrease value on AI thinking time
  static thinkingTime = 2000;
  aiTriggered = false;

  constructor(
    private playerQuery: PlayerQuery,
    private aiRandomService: AiRandomService,
    private aiMinimaxingService: AiMinimaxingService,
    private aiDqnService: AiDqnService,
    private aiDqn1Service: AiDqn1Service,
    private aiDqn2Service: AiDqn2Service,
    private aiDqn3Service: AiDqn3Service,
    private aiDqn4Service: AiDqn4Service,
    private aiDqn5Service: AiDqn5Service,
    private aiHybridService: AiHybridService
  ) {
  }

  // live play
  getMoveCurrentPlayer(matrix: number[][]): Move {
    const player = this.playerQuery.isPlaying();

    switch (player.botType) {
      case 'random':
        return this.aiRandomService.getMove(matrix, player.godType);
        // return this.aiDqn2Service.getMove(matrix, player.godType);
        // return this.aiMinimaxingService.getMove4(matrix, player.godType);
      case 'minimax':
        return this.aiMinimaxingService.getMove(matrix, player.godType);
      case 'dqn':
        return this.aiDqnService.getMove(matrix, player.godType);
      case 'hybrid':
        const bestDQNMove = this.aiDqn5Service.getMove(matrix, player.godType);
        return this.aiHybridService.getMove(matrix, player.godType, bestDQNMove);
      default:
        return this.aiRandomService.getMove(matrix, player.godType);
    }
  }

  // simulations
  public getMove(matrix: number[][], godType: GodType, botType: BotTypes): Move {
    switch (botType) {
      case BotTypes.RANDOM:
        return this.aiRandomService.getMove(matrix, godType);
        // return this.aiMinimaxingService.getMove4(matrix, godType);
      // return this.aiDqn2Service.getMove(matrix, godType);
      case BotTypes.MINIMAX:
        return this.aiMinimaxingService.getMove(matrix, godType);
      case BotTypes.DQN:
        return this.aiDqnService.getMove(matrix, godType);
      case BotTypes.HYBRID:
        const bestDQNMove = this.aiDqn5Service.getMove(matrix, godType);
        return this.aiHybridService.getMove(matrix, godType, bestDQNMove);
      default:
        return this.aiRandomService.getMove(matrix, godType);
    }
  }

  static getPossiblesMoves(matrix: number[][], isPlaying: GodType): Move[] {
    const possibleWalkFields: Walk[] = [];
    const possibleRotationPositions: Rotation[] = [];

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const piece = matrix[y][x];
        const fromField: Field = {x, y};

        if (PieceComponent.getType(piece) !== PieceType.NONE) {
          if (isPlaying === GodType.NANAHUATZIN && piece >= 100) {
            possibleWalkFields.push(...MoveValidatorService.getPossibleFields(piece, fromField.x, fromField.y, matrix));
            possibleRotationPositions.push(...MoveValidatorService.getPossibleRotations(piece, fromField.x, fromField.y));
          } else if (isPlaying === GodType.CAMAXTLI && piece < 100) {
            possibleWalkFields.push(...MoveValidatorService.getPossibleFields(piece, fromField.x, fromField.y, matrix));
            possibleRotationPositions.push(...MoveValidatorService.getPossibleRotations(piece, fromField.x, fromField.y));
          }
        }
      }
    }

    return [...possibleWalkFields, ...possibleRotationPositions];
  }

  static shuffle(array: any[]): any[] {
    // return array;
    return array.sort(() => Math.random() - 0.5);
  }

  static order(array: any[]): any[] {
    // return array;
    return array.sort(() => Math.random() - 0.5);
  }

  static executeMoveWithReward(matrix: number[][], move: Move, isPlaying: GodType): {
    reward: number, nextState: number[][], winner: GodType | undefined, lightCount: number
  } {
    const nextState = this.executeMove(move, matrix, isPlaying);

    return this.executeLightWithReward(nextState, isPlaying);
  }

  static executeMove(move: Move, matrix: number[][], isPlaying: GodType): number[][] {
    const nextState = MatrixService.copy(matrix);

    switch (move.type) {
      case MoveType.WALK:
        this.executeWalk(nextState, move.position, move.to!);
        break;
      case MoveType.ROTATE:
        this.executeRotate(nextState, move.position, move.toPiece!);
        break;
      default:
        console.error('Move type could not be found', move, matrix, isPlaying);
        throw new Error('Move type could not be found');
    }

    return nextState;
  }

  static executeLightWithReward(nextState: number[][], isPlaying: GodType): {
    reward: number, nextState: number[][], winner: GodType | undefined, lightCount: number
  } {
    const lightResult: { lightCount: number, destroy: number | undefined, block: true | undefined } = this.executeLight(nextState, isPlaying);
    const winner: GodType | undefined = WinnerValidatorService.checkWinnerWithGod(nextState);

    if (winner !== undefined && winner === isPlaying) {
      return {reward: Rewards.WIN, nextState, winner, lightCount: lightResult.lightCount};
    }
    if (winner !== undefined && winner !== isPlaying) {
      return {reward: Rewards.LOSE, nextState, winner, lightCount: lightResult.lightCount};
    }

    if (lightResult.destroy !== undefined) {
      const pieceType = PieceComponent.getType(lightResult.destroy);
      let pieceReward = 0;
      if (pieceType === PieceType.WALL) {
        pieceReward = Rewards.WALL;
      } else if (pieceType === PieceType.ANGLER) {
        pieceReward = Rewards.ANGLER;
      }

      const nega = isPlaying === GodType.CAMAXTLI && lightResult.destroy < 100 ? true :
        isPlaying === GodType.NANAHUATZIN && lightResult.destroy >= 100;

      return {
        reward: nega ? Rewards.DESTROY_OWN + -1 * pieceReward : Rewards.DESTROY_ENEMY + pieceReward,
        nextState,
        winner,
        lightCount: lightResult.lightCount
      };
    }

    if (lightResult.block !== undefined) {
      return {reward: Rewards.BLOCK, nextState, winner, lightCount: lightResult.lightCount};
    }

    return {reward: 0, nextState, winner, lightCount: lightResult.lightCount};
  }

  private static executeWalk(matrix: number[][], from: Field, to: Field): void {
    const fromPiece = matrix[from.y][from.x];
    const targetPiece = matrix[to.y][to.x];

    matrix[from.y][from.x] = targetPiece; // in case if it is a swap
    matrix[to.y][to.x] = fromPiece;
  }

  private static executeRotate(matrix: number[][], position: Field, toPiece: number): void {
    matrix[position.y][position.x] = toPiece;
  }

  public static executeLight(matrix: number[][], isPlaying: GodType): { lightCount: number, destroy: number | undefined, block: true | undefined } {
    let startPosition: Field = this.getStartPosition(isPlaying, matrix);

    let direction: Direction = LightValidatorService.getSUNDirection(matrix[startPosition.y][startPosition.x]);
    let nextPosition = LightValidatorService.getNextPosition(direction.type, startPosition);
    let lightCount = 0;

    while (nextPosition && LightValidatorService.nextPositionAvailable(nextPosition, matrix)) {
      let piece = matrix[nextPosition.y][nextPosition.x];
      lightCount += 1;

      if (piece !== 0) {
        lightCount += 1; // it's better to have pieces involved

        const nextDirection: Direction = LightValidatorService.getDirection(piece, direction.type, nextPosition);

        if (nextDirection.destroy) {
          matrix[nextPosition.y][nextPosition.x] = 0; // destroy piece on matrix
          return {lightCount, destroy: piece, block: undefined};
        } else if (nextDirection.block) {
          return {lightCount, destroy: undefined, block: true};
        } else {
          direction = nextDirection;
        }
      }

      nextPosition = LightValidatorService.getNextPosition(direction.type, nextPosition);
    }


    return {destroy: undefined, lightCount, block: undefined};
  }

  // formula: cell id * actions count + chosen action => gives position of the action index
  // action space: 11 for each piece
  // SUN on cell 0, walk up left -> 0
  // SUN on cell 0, walk up -> 1
  // SUN on cell 0, walk up-right -> 2
  // SUN on cell 0, walk right -> 3
  // SUN on cell 0, walk right-down -> 4
  // SUN on cell 0, walk down -> 5
  // SUN on cell 0, walk down-left -> 6
  // SUN on cell 0, walk left -> 7
  // SUN on cell 0, rotate up -> 8
  // SUN on cell 0, rotate right -> 9
  // SUN on cell 0, rotate down -> 10
  // SUN on cell 0, rotate left -> 11
  // example 1 with formula: KING on cell 1 goes right -> 1 * 11 + 3 = 14
  // example 2 with formula: ANGLER on cell 15 rotates left -> 15 * 11 + 10 = 175
  // example 3 with formula: SUN on cell 41 rotates right -> 41 * 11 + 11 = 462
  public static getPossibleMoveIndexList(state: number[][], isPlaying: GodType): MoveIndex[] {
    const possiblesMoves: Move[] = this.getPossiblesMoves(state, isPlaying);
    const possibleMoveIndexList: MoveIndex[] = [];

    for (let i = 0; i < possiblesMoves.length; i++) {
      const possibleMove: Move = possiblesMoves[i];
      const actionIndex: number = this.getActionIndex(possibleMove);
      const indexValue: number = this.getMinimizedIndexValue(possibleMove.position, actionIndex);

      possibleMoveIndexList.push({
        index: indexValue,
        move: possibleMove
      });
    }

    // smallest possible action (piece can't walk around) -> should be indexed 0
    // const move: Rotation = {
    //   type: MoveType.ROTATE,
    //   piece: 121,
    //   position: {x: 0, y: 0},
    //   toPiece: 111
    // };

    // should be indexed 1
    // const move: Rotation = {
    //   type: MoveType.ROTATE,
    //   piece: 111,
    //   position: {x: 0, y: 0},
    //   toPiece: 121
    // };

    // first possible walk - should be indexed 2
    // const move: Walk = {
    //   type: MoveType.WALK,
    //   piece: 3,
    //   position: {x: 1, y: 0},
    //   to: {x: 2, y: 0}
    // };

    // last possible action
    // const move: Rotation = {
    //   type: MoveType.ROTATE,
    //   piece: 1,
    //   position: {x: 6, y: 5},
    //   toPiece: 31
    // };

    // impossible move
    // const move: Walk = {
    //   type: MoveType.WALK,
    //   piece: 121,
    //   position: {x: 0, y: 0},
    //   to: {x: 1, y: 0}
    // };


    // console.log('CELL ID', this.getCellID(move.position));
    // console.log('ACTION INDEX', this.getActionIndex(move));
    // console.log('INDEX VALUE', this.getMinimizedIndexValue(move.position, this.getActionIndex(move)));


    return possibleMoveIndexList;
  }

  private static getCellID(position: Field): number {
    let cellCount = 0;
    for (let y = 0; y < MatrixStore.HEIGHT_NUMBER; y++) {
      for (let x = 0; x < MatrixStore.WIDTH_NUMBER; x++) {

        if (position.y === y && position.x === x) {
          return cellCount;
        }

        cellCount++;
      }
    }

    console.error(position);
    throw Error("Error on finding cell id for x: " + position.x + ' and' + position.y);
  }

  private static getActionIndex(move: Move): number {
    // walk
    if (move.type === MoveType.WALK) {
      if (move.to!.x < move.position.x && move.to!.y < move.position.y) {
        return ActionSpace.W_UP_LEFT;
      }
      if (move.to!.x === move.position.x && move.to!.y < move.position.y) {
        return ActionSpace.W_UP_MID;
      }
      if (move.to!.x > move.position.x && move.to!.y < move.position.y) {
        return ActionSpace.W_UP_RIGHT;
      }
      if (move.to!.x > move.position.x && move.to!.y === move.position.y) {
        return ActionSpace.W_MID_RIGHT;
      }
      if (move.to!.x > move.position.x && move.to!.y > move.position.y) {
        return ActionSpace.W_DOWN_RIGHT;
      }
      if (move.to!.x === move.position.x && move.to!.y > move.position.y) {
        return ActionSpace.W_DOWN_MID;
      }
      if (move.to!.x < move.position.x && move.to!.y > move.position.y) {
        return ActionSpace.W_DOWN_LEFT;
      }
      if (move.to!.x < move.position.x && move.to!.y === move.position.y) {
        return ActionSpace.W_MID_LEFT;
      }
    }
    // rotate
    else if (move.type === MoveType.ROTATE) {
      // 0 = 0°, 1 = 90°, 2 = 180°, 3 = 270°
      const newRotation = MoveValidatorService.getRotation(move.toPiece!);

      if (newRotation === 0) {
        return ActionSpace.R_UP;
      }
      if (newRotation === 1) {
        return ActionSpace.R_RIGHT;
      }
      if (newRotation === 2) {
        return ActionSpace.R_DOWN;
      }
      if (newRotation === 3) {
        return ActionSpace.R_LEFT;
      }
    }

    console.error(move);
    throw Error("Error on finding action index for move");
  }

  public static getMoveFromIndex(state: number[][], isPlaying: GodType, move: number): Move {
    const possiblesMoves = this.getPossiblesMoves(state, isPlaying);

    for (let i = 0; i < possiblesMoves.length; i++) {
      const possibleMove = possiblesMoves[i];

      if (this.getMoveToIndex(possibleMove) === move) {
        return possibleMove;
      }
    }

    console.error('Move could not be found with index: ', move, possiblesMoves, state);
    throw new Error('Move could not be found!');
  }


  public static evaluatePosition(matrix: number[][], isPlaying: GodType): number {
    const isSwappedPosition = MatrixQuery.isSwappedMatrixPosition(matrix);
    const normalizedState = isSwappedPosition ? MatrixService.swapMatrix(matrix) : matrix;

    let adjustReward = 0;
    let sideRankPieces = 0;

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const fieldValue = matrix[y][x];

        // is a piece on it
        if (fieldValue > 0) {
          const pieceType = PieceComponent.getType(fieldValue);

          // validate king position
          if (pieceType === PieceType.KING) {
            adjustReward += this.adjustRewardWithKingPosition({x, y}, isPlaying, normalizedState);
          }
          // analyse piece positions
          else {
            adjustReward += this.adjustRewardWithPieces(isPlaying, pieceType, fieldValue);
          }

          // piece position on a siderank
          if (isPlaying === GodType.CAMAXTLI) {
            if (x === matrix[y].length - 1) sideRankPieces++
          }
          if (isPlaying === GodType.NANAHUATZIN) {
            if (x === 0) sideRankPieces++;
          }
        }
      }
    }

    if (sideRankPieces === 1) adjustReward += Rewards.POSITION * 10;

    return adjustReward;
  }

  public static evaluateLight(state: number[][], isPlaying: GodType): number {
    const isSwappedPosition = MatrixQuery.isSwappedMatrixPosition(state);
    const normalizedNextState = isSwappedPosition ? MatrixService.swapMatrix(state) : state;

    return this.adjustRewardWithInvolvedPieces(isPlaying, normalizedNextState, 0);
  }

  public static adjustRewardWithKingPosition(kingPosition: Field, isPlaying: GodType, matrix: number[][]): number {
    let adjustReward = 0;

    // is king in the back rank
    if (isPlaying === GodType.CAMAXTLI) {
      if (kingPosition.y === matrix.length - 1) {
        adjustReward += Rewards.POSITION * 100;
      }
    }
    if (isPlaying === GodType.NANAHUATZIN) {
      if (kingPosition.y === 0) {
        adjustReward += Rewards.POSITION * 100;
      }
    }

    // pieces around king
    if (isPlaying === GodType.CAMAXTLI) {
      const leftUpField = MoveValidatorService.getLEFTUPField(kingPosition.x, kingPosition.y);
      if (leftUpField && matrix[leftUpField.y][leftUpField.x] < 100 && matrix[leftUpField.y][leftUpField.x] !== 0) {
        adjustReward += Rewards.POSITION;
      }
      const upField = MoveValidatorService.getUPField(kingPosition.x, kingPosition.y);
      if (upField && matrix[upField.y][upField.x] < 100 && matrix[upField.y][upField.x] !== 0) {
        adjustReward += Rewards.POSITION;
      }
      const upRightField = MoveValidatorService.getUPRIGHTField(kingPosition.x, kingPosition.y, matrix);
      if (upRightField && matrix[upRightField.y][upRightField.x] < 100 && matrix[upRightField.y][upRightField.x] !== 0) {
        adjustReward += Rewards.POSITION;
      }
      const leftField = MoveValidatorService.getLEFTField(kingPosition.x, kingPosition.y);
      if (leftField && matrix[leftField.y][leftField.x] < 100 && matrix[leftField.y][leftField.x] !== 0) {
        adjustReward += Rewards.POSITION;
      }
      const rightField = MoveValidatorService.getRIGHTField(kingPosition.x, kingPosition.y, matrix);
      if (rightField && matrix[rightField.y][rightField.x] < 100 && matrix[rightField.y][rightField.x] !== 0) {
        adjustReward += Rewards.POSITION;
      }
      const downLeftField = MoveValidatorService.getDOWNLEFTField(kingPosition.x, kingPosition.y, matrix);
      if (downLeftField && matrix[downLeftField.y][downLeftField.x] < 100 && matrix[downLeftField.y][downLeftField.x] !== 0) {
        adjustReward += Rewards.POSITION;
      }
      const downField = MoveValidatorService.getDOWNField(kingPosition.x, kingPosition.y, matrix);
      if (downField && matrix[downField.y][downField.x] < 100 && matrix[downField.y][downField.x] !== 0) {
        adjustReward += Rewards.POSITION;
      }
      const rightDownField = MoveValidatorService.getRIGHTDOWNField(kingPosition.x, kingPosition.y, matrix);
      if (rightDownField && matrix[rightDownField.y][rightDownField.x] < 100 && matrix[rightDownField.y][rightDownField.x] !== 0) {
        adjustReward += Rewards.POSITION;
      }
    }
    if (isPlaying === GodType.NANAHUATZIN) {
      const leftUpField = MoveValidatorService.getLEFTUPField(kingPosition.x, kingPosition.y);
      if (leftUpField && matrix[leftUpField.y][leftUpField.x] >= 100) {
        adjustReward += Rewards.POSITION;
      }
      const upField = MoveValidatorService.getUPField(kingPosition.x, kingPosition.y);
      if (upField && matrix[upField.y][upField.x] >= 100) {
        adjustReward += Rewards.POSITION;
      }
      const upRightField = MoveValidatorService.getUPRIGHTField(kingPosition.x, kingPosition.y, matrix);
      if (upRightField && matrix[upRightField.y][upRightField.x] >= 100) {
        adjustReward += Rewards.POSITION;
      }
      const leftField = MoveValidatorService.getLEFTField(kingPosition.x, kingPosition.y);
      if (leftField && matrix[leftField.y][leftField.x] >= 100) {
        adjustReward += Rewards.POSITION;
      }
      const rightField = MoveValidatorService.getRIGHTField(kingPosition.x, kingPosition.y, matrix);
      if (rightField && matrix[rightField.y][rightField.x] >= 100) {
        adjustReward += Rewards.POSITION;
      }
      const downLeftField = MoveValidatorService.getDOWNLEFTField(kingPosition.x, kingPosition.y, matrix);
      if (downLeftField && matrix[downLeftField.y][downLeftField.x] >= 100) {
        adjustReward += Rewards.POSITION;
      }
      const downField = MoveValidatorService.getDOWNField(kingPosition.x, kingPosition.y, matrix);
      if (downField && matrix[downField.y][downField.x] >= 100) {
        adjustReward += Rewards.POSITION;
      }
      const rightDownField = MoveValidatorService.getRIGHTDOWNField(kingPosition.x, kingPosition.y, matrix);
      if (rightDownField && matrix[rightDownField.y][rightDownField.x] >= 100) {
        adjustReward += Rewards.POSITION;
      }
    }

    return adjustReward;
  }

  public static adjustRewardWithInvolvedPieces(isPlaying: GodType, matrix: number[][], adjustReward: number): number {
    const lightDistance = this.collectDistance(isPlaying, matrix);
    adjustReward += Rewards.POSITION * lightDistance;

    return adjustReward;
  }

  public static adjustRewardWithPieces(isPlaying: GodType, pieceType: PieceType, pieceValue: number): number {
    let adjustReward = 0;

    if (isPlaying === GodType.CAMAXTLI) {
      if (pieceValue < 100) {
        if (pieceType === PieceType.WALL) adjustReward += Rewards.WALL * 10;
        if (pieceType === PieceType.ANGLER) adjustReward += Rewards.ANGLER * 10;
      }
    }

    if (isPlaying === GodType.NANAHUATZIN) {
      if (pieceValue >= 100) {
        if (pieceType === PieceType.WALL) adjustReward += Rewards.WALL * 10;
        if (pieceType === PieceType.ANGLER) adjustReward += Rewards.ANGLER * 10;
      }
    }

    return adjustReward;
  }

  private static getKingPosition(matrix: number[][], isPlaying: GodType): Field {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x] !== 0) {
          if (PieceComponent.getType(matrix[y][x]) === PieceType.KING) {
            if (matrix[y][x] < 100 && isPlaying === GodType.CAMAXTLI) {
              return {x, y}
            }

            if (matrix[y][x] >= 100 && isPlaying === GodType.NANAHUATZIN) {
              return {x, y}
            }
          }
        }
      }
    }

    console.error("King should exist on board", matrix, isPlaying);
    throw Error("King should exists");
  }

  // shoot light from is playing if light is hitting a piece
  // or a piece is around x square away from the light add it to possible peaces
  public static getAffectedMoves(matrix: number[][], isPlaying: GodType, lightRadius: number): Move[] {
    // cell id and field
    const pieces: Map<string, Field> = new Map();

    this.collectPiecesAndDistance(isPlaying, matrix, pieces, lightRadius);
    this.collectPiecesAndDistance(isPlaying === GodType.CAMAXTLI ? GodType.NANAHUATZIN : GodType.CAMAXTLI, matrix, pieces, lightRadius);

    const moves: Move[] = [];
    for (let field of pieces.values()) {
      const piece = matrix[field.y][field.x];

      if ((isPlaying === GodType.CAMAXTLI && piece < 100) || (isPlaying === GodType.NANAHUATZIN && piece >= 100)) {
        const possibleFields = MoveValidatorService.getPossibleFields(piece, field.x, field.y, matrix);
        moves.push(...possibleFields);
        const possibleRotations = MoveValidatorService.getPossibleRotations(piece, field.x, field.y);
        moves.push(...possibleRotations);
      }
    }

    const piecesDirectInLight: Map<string, Field> = new Map();
    this.collectPiecesAndDistance(isPlaying, matrix, piecesDirectInLight, 0);

    // increase distance if no piece to move has been found or only pieces in the light can be moved
    if ((pieces.size === 0 || pieces.size === piecesDirectInLight.size) && lightRadius < matrix[0].length) {
      return this.getAffectedMoves(matrix, isPlaying, lightRadius + 1);
    }

    return moves;
  }

  private static collectPiecesAndDistance(sun: GodType, matrix: number[][], pieces: Map<string, Field>, lightRadius: number): number {
    let startPosition: Field = this.getStartPosition(sun, matrix);
    this.checkPiecesAround(pieces, matrix, startPosition, lightRadius);
    let direction: Direction = LightValidatorService.getSUNDirection(matrix[startPosition.y][startPosition.x]);
    let nextPosition: Field | undefined = LightValidatorService.getNextPosition(direction.type, startPosition);
    let lightCount = 0;

    while (nextPosition && LightValidatorService.nextPositionAvailable(nextPosition, matrix)) {
      let piece = matrix[nextPosition.y][nextPosition.x];
      lightCount += 1;

      if (piece !== 0) {
        const nextDirection: Direction = LightValidatorService.getDirection(piece, direction.type, nextPosition);

        if (nextDirection.destroy) {
          break; // don't go further
        } else if (nextDirection.block) {
          break; // don't go further
        } else {
          direction = nextDirection;
        }
      }

      this.checkPiecesAround(pieces, matrix, nextPosition, lightRadius);
      nextPosition = LightValidatorService.getNextPosition(direction.type, nextPosition);
    }

    return lightCount;
  }

  private static collectDistance(sun: GodType, matrix: number[][]): number {
    let startPosition: Field = this.getStartPosition(sun, matrix);
    let direction: Direction = LightValidatorService.getSUNDirection(matrix[startPosition.y][startPosition.x]);
    let nextPosition: Field | undefined = LightValidatorService.getNextPosition(direction.type, startPosition);
    let lightCount = 0;

    while (nextPosition && LightValidatorService.nextPositionAvailable(nextPosition, matrix)) {
      let piece = matrix[nextPosition.y][nextPosition.x];
      lightCount += 1;

      if (piece !== 0) {
        lightCount += 1; // it's better to have pieces involved

        const nextDirection: Direction = LightValidatorService.getDirection(piece, direction.type, nextPosition);

        if (nextDirection.destroy) {
          break; // don't go further
        } else if (nextDirection.block) {
          break; // don't go further
        } else {
          direction = nextDirection;
        }
      }

      nextPosition = LightValidatorService.getNextPosition(direction.type, nextPosition);
    }

    return lightCount;
  }

  private static getStartPosition(isPlaying: GodType, matrix: number[][]): Field {
    return (isPlaying === GodType.CAMAXTLI && matrix[0][0] < 100)
    || (isPlaying == GodType.NANAHUATZIN && matrix[0][0] >= 100) ? {x: 0, y: 0} : {
      x: (MatrixStore.WIDTH_NUMBER - 1),
      y: MatrixStore.HEIGHT_NUMBER - 1
    };
  }

  private static checkPiecesAround(
    pieces: Map<string, Field>, matrix: number[][], position: Field | undefined, lightDistance: number
  ): void {
    if (!position) return;

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const piece = matrix[y][x];
        if (piece !== 0) {
          const distanceX = Math.abs(position.x - x);
          const distanceY = Math.abs(position.y - y);

          if (distanceX <= lightDistance && distanceY <= lightDistance) {
            const key = '' + x + y;
            pieces.set(key, {x, y});
          }
        }
      }
    }
  }

  private static isPlayingPieceHere(isPlaying: GodType, piece: number): boolean {
    if (isPlaying === GodType.CAMAXTLI && piece < 100 && piece !== 0) return true;
    if (isPlaying === GodType.NANAHUATZIN && piece >= 100) return true;

    return false;
  }

  public static getIndexListToSkip(W: number, H: number): number[] {
    // some actions are not possible, filter those, ex. from rank 0 go upwards / from last rank go down
    const skipIndexList: Set<number> = new Set();

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {

        // corner top left - sun can not walk
        if (y === 0 && x === 0) {
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_MID));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_MID_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_MID));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_MID_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.R_UP));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.R_LEFT));
        }
        // corner top right
        else if (y === 0 && x === W - 1) {
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_MID));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_MID_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_RIGHT));
        }
        // corner bottom left
        else if (y === H - 1 && x === 0) {
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_MID));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_MID_LEFT));
        }
        // corner bottom right - sun can not walk
        else if (y === H - 1 && x === W - 1) {
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_MID));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_MID_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_MID));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_MID_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.R_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.R_DOWN));
        }
        // top rank without corners
        else if (y === 0 && x < W - 1) {
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_MID));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_RIGHT));
        }
        // bottom rank without corners
        else if (y === H - 1 && x > 0 && x < W - 1) {
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_MID));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_LEFT));
        }
        // left rank without corners
        else if (y > 0 && x === 0 && y < H - 1) {
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_LEFT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_MID_LEFT));
        }
        // right rank without corners
        else if (y > 0 && x === W - 1 && y < H - 1) {
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_UP_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_MID_RIGHT));
          skipIndexList.add(this.getIndexValue({x, y}, ActionSpace.W_DOWN_RIGHT));
        }
      }
    }

    return [...skipIndexList]
  }

  private static getMinimizedIndexValue(field: Field, actionSpace: ActionSpace) {
    let indexValue = this.getIndexValue({x: field.x, y: field.y}, actionSpace);

    if (MatrixStore.IMPOSSIBLE_INDEXES.includes(indexValue)) {
      console.error('Move Index is wrong `field, actionSpace, isPlaying, indexValue`', field, actionSpace, indexValue);
      throw Error('Move Index is wrong');
    }

    let subtract = 0;
    for (let i = 0; i < MatrixStore.IMPOSSIBLE_INDEX_LENGTH; i++) {
      const entry = MatrixStore.IMPOSSIBLE_INDEXES[i];
      if (entry < indexValue) subtract += 1;
      else break;
    }

    return indexValue - subtract;
  }

  private static getIndexValue(field: Field, actionSpace: ActionSpace) {
    const cellID = this.getCellID({x: field.x, y: field.y});
    return cellID * MatrixStore.MAX_ACTION_INDEX + actionSpace;
  }

  public static getMoveToIndex(move: Move): number {
    const actionIndex: number = this.getActionIndex(move);
    return this.getMinimizedIndexValue(move.position, actionIndex);
  }

}
