import { boardFromTiles, canMove, hasWinningTile, slideTiles, spawnTile } from './board';
import type { Direction, GameSnapshot, GameState, Rng, Tile } from './types';

const MAX_HISTORY = 20;

function tilesFromNumeric(board: number[][], nextId: { value: number }, isNew = false): Tile[] {
  const tiles: Tile[] = [];
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const value = board[row][col];
      if (value > 0) {
        tiles.push({
          id: nextId.value,
          value,
          row,
          col,
          isNew,
        });
        nextId.value += 1;
      }
    }
  }
  return tiles;
}

function snapshotOf(state: Pick<GameState, 'tiles' | 'score' | 'moves'>): GameSnapshot {
  return {
    tiles: state.tiles.map((tile) => ({ ...tile, isNew: false, isMerged: false })),
    score: state.score,
    moves: state.moves,
  };
}

export function createNewGame(bestScore = 0, random: Rng = Math.random): GameState {
  const nextId = { value: 1 };
  let board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const first = spawnTile(board, random);
  board = first.board;
  const second = spawnTile(board, random);
  board = second.board;

  const tiles = tilesFromNumeric(board, nextId, true);

  return {
    tiles,
    ghosts: [],
    score: 0,
    bestScore,
    moves: 0,
    elapsedMs: 0,
    won: false,
    wonAcknowledged: false,
    over: false,
    history: [],
    nextId: nextId.value,
  };
}

export function createGameFromBoard(
  board: number[][],
  options: Partial<Omit<GameState, 'tiles' | 'nextId'>> = {}
): GameState {
  const nextId = { value: 1 };
  const tiles = tilesFromNumeric(board, nextId);
  const numeric = boardFromTiles(tiles);

  return {
    tiles,
    ghosts: [],
    score: options.score ?? 0,
    bestScore: options.bestScore ?? options.score ?? 0,
    moves: options.moves ?? 0,
    elapsedMs: options.elapsedMs ?? 0,
    won: options.won ?? hasWinningTile(numeric),
    wonAcknowledged: options.wonAcknowledged ?? false,
    over: options.over ?? !canMove(numeric),
    history: options.history ?? [],
    nextId: nextId.value,
  };
}

export function applyMove(state: GameState, direction: Direction, random: Rng = Math.random): GameState {
  if (state.over || (state.won && !state.wonAcknowledged)) {
    return state;
  }

  const slid = slideTiles(state.tiles, direction);
  if (!slid.moved) {
    return { ...state, ghosts: [] };
  }

  const history = [...state.history, snapshotOf(state)].slice(-MAX_HISTORY);
  let nextId = state.nextId;
  const spawned = spawnTile(boardFromTiles(slid.tiles), random);
  const tiles = slid.tiles.map((tile) => ({ ...tile, isNew: false }));

  if (spawned.spawned) {
    tiles.push({
      id: nextId,
      value: spawned.spawned.value,
      row: spawned.spawned.row,
      col: spawned.spawned.col,
      isNew: true,
    });
    nextId += 1;
  }

  const score = state.score + slid.scoreGained;
  const board = boardFromTiles(tiles);

  return {
    ...state,
    tiles,
    ghosts: slid.ghosts,
    score,
    bestScore: Math.max(state.bestScore, score),
    moves: state.moves + 1,
    won: state.won || hasWinningTile(board),
    over: !canMove(board),
    history,
    nextId,
  };
}

export function undoMove(state: GameState): GameState {
  if (state.history.length === 0) {
    return state;
  }

  const previous = state.history[state.history.length - 1];
  const tiles = previous.tiles.map((tile) => ({ ...tile, isNew: false, isMerged: false }));
  const board = boardFromTiles(tiles);
  const won = hasWinningTile(board);

  return {
    ...state,
    tiles,
    ghosts: [],
    score: previous.score,
    moves: previous.moves,
    won,
    wonAcknowledged: won ? state.wonAcknowledged : false,
    over: !canMove(board),
    history: state.history.slice(0, -1),
  };
}

export function acknowledgeWin(state: GameState): GameState {
  if (!state.won || state.wonAcknowledged) {
    return state;
  }
  return { ...state, wonAcknowledged: true, ghosts: [] };
}

export function restoreGame(partial: {
  tiles: Tile[];
  score: number;
  bestScore: number;
  moves: number;
  elapsedMs: number;
  won: boolean;
  wonAcknowledged: boolean;
  over: boolean;
  history: GameSnapshot[];
}): GameState {
  const tiles = partial.tiles.map((tile) => ({
    id: tile.id,
    value: tile.value,
    row: tile.row,
    col: tile.col,
  }));
  const history = partial.history.map((snapshot) => ({
    score: snapshot.score,
    moves: snapshot.moves,
    tiles: snapshot.tiles.map((tile) => ({
      id: tile.id,
      value: tile.value,
      row: tile.row,
      col: tile.col,
    })),
  }));
  const nextId =
    Math.max(
      0,
      ...tiles.map((tile) => tile.id),
      ...history.flatMap((snapshot) => snapshot.tiles.map((tile) => tile.id))
    ) + 1;
  const board = boardFromTiles(tiles);

  return {
    tiles,
    ghosts: [],
    score: partial.score,
    bestScore: partial.bestScore,
    moves: partial.moves,
    elapsedMs: partial.elapsedMs,
    won: partial.won || hasWinningTile(board),
    wonAcknowledged: partial.wonAcknowledged,
    over: partial.over || !canMove(board),
    history,
    nextId,
  };
}

export function restartGame(state: GameState, random: Rng = Math.random): GameState {
  return createNewGame(state.bestScore, random);
}
