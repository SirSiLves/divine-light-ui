export interface Piece {
  id: number;
  y: number;
  x: number;
  type: PieceType;
}

export enum PieceType {
  NONE = 'None',
  SUN = 'Sun',
  KING = 'King',
  WALL = 'Wall',
  REFLECTOR = 'Reflector',
  ANGLER = 'Angler'
}
