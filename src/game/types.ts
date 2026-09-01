export const SIZE = 4;

export type Direction = 'up' | 'down' | 'left' | 'right';

export type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
};

export type GhostTile = {
  id: number;
  value: number;
  row: number;
  col: number;
  fromRow: number;
  fromCol: number;
};

export type NumericBoard = number[][];

export type GameSnapshot = {
  tiles: Tile[];
  score: number;
  moves: number;
};

export type GameState = {
  tiles: Tile[];
  ghosts: GhostTile[];
  score: number;
  bestScore: number;
  moves: number;
  elapsedMs: number;
  won: boolean;
  wonAcknowledged: boolean;
  over: boolean;
  history: GameSnapshot[];
  nextId: number;
};

export type Rng = () => number;
