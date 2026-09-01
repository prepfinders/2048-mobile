import { SIZE, type Direction, type GhostTile, type NumericBoard, type Rng, type Tile } from './types';

export function createEmptyBoard(): NumericBoard {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export function cloneBoard(board: NumericBoard): NumericBoard {
  return board.map((row) => [...row]);
}

export function boardFromTiles(tiles: Tile[]): NumericBoard {
  const board = createEmptyBoard();
  for (const tile of tiles) {
    board[tile.row][tile.col] = tile.value;
  }
  return board;
}

export function getEmptyCells(board: NumericBoard): [number, number][] {
  const cells: [number, number][] = [];
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] === 0) {
        cells.push([row, col]);
      }
    }
  }
  return cells;
}

export function slideAndMergeLine(line: number[]): {
  line: number[];
  score: number;
  moved: boolean;
} {
  const compact = line.filter((value) => value !== 0);
  const merged: number[] = [];
  let score = 0;
  let index = 0;

  while (index < compact.length) {
    if (index + 1 < compact.length && compact[index] === compact[index + 1]) {
      const value = compact[index] * 2;
      merged.push(value);
      score += value;
      index += 2;
    } else {
      merged.push(compact[index]);
      index += 1;
    }
  }

  while (merged.length < SIZE) {
    merged.push(0);
  }

  const moved = merged.some((value, i) => value !== line[i]);
  return { line: merged, score, moved };
}

function lineCoordinates(lineIndex: number, direction: Direction): { row: number; col: number }[] {
  return Array.from({ length: SIZE }, (_, slot) => {
    switch (direction) {
      case 'left':
        return { row: lineIndex, col: slot };
      case 'right':
        return { row: lineIndex, col: SIZE - 1 - slot };
      case 'up':
        return { row: slot, col: lineIndex };
      case 'down':
        return { row: SIZE - 1 - slot, col: lineIndex };
    }
  });
}

export function moveBoard(
  board: NumericBoard,
  direction: Direction
): { board: NumericBoard; scoreGained: number; moved: boolean } {
  const next = cloneBoard(board);
  let scoreGained = 0;
  let moved = false;

  for (let lineIndex = 0; lineIndex < SIZE; lineIndex += 1) {
    const coords = lineCoordinates(lineIndex, direction);
    const line = coords.map(({ row, col }) => next[row][col]);
    const result = slideAndMergeLine(line);
    scoreGained += result.score;
    if (result.moved) {
      moved = true;
    }
    coords.forEach(({ row, col }, i) => {
      next[row][col] = result.line[i];
    });
  }

  return { board: next, scoreGained, moved };
}

export function spawnTile(
  board: NumericBoard,
  random: Rng = Math.random
): { board: NumericBoard; spawned: { row: number; col: number; value: number } | null } {
  const empty = getEmptyCells(board);
  if (empty.length === 0) {
    return { board, spawned: null };
  }

  const index = Math.min(empty.length - 1, Math.floor(random() * empty.length));
  const [row, col] = empty[index];
  const value = random() < 0.9 ? 2 : 4;
  const next = cloneBoard(board);
  next[row][col] = value;
  return { board: next, spawned: { row, col, value } };
}

export function canMove(board: NumericBoard): boolean {
  if (getEmptyCells(board).length > 0) {
    return true;
  }

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = board[row][col];
      if (col + 1 < SIZE && board[row][col + 1] === value) {
        return true;
      }
      if (row + 1 < SIZE && board[row + 1][col] === value) {
        return true;
      }
    }
  }

  return false;
}

export function hasWinningTile(board: NumericBoard): boolean {
  return board.some((row) => row.some((value) => value >= 2048));
}

export function slideTiles(
  tiles: Tile[],
  direction: Direction
): { tiles: Tile[]; ghosts: GhostTile[]; scoreGained: number; moved: boolean } {
  const grid: (Tile | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  for (const tile of tiles) {
    grid[tile.row][tile.col] = tile;
  }

  const nextTiles: Tile[] = [];
  const ghosts: GhostTile[] = [];
  let scoreGained = 0;
  let moved = false;

  for (let lineIndex = 0; lineIndex < SIZE; lineIndex += 1) {
    const coords = lineCoordinates(lineIndex, direction);
    const compact = coords
      .map((coord, slot) => {
        const tile = grid[coord.row][coord.col];
        return tile ? { tile, slot } : null;
      })
      .filter((entry): entry is { tile: Tile; slot: number } => entry !== null);

    let write = 0;
    let index = 0;
    while (index < compact.length) {
      const current = compact[index];
      const next = compact[index + 1];
      const dest = coords[write];
      const movedThisTile = current.tile.row !== dest.row || current.tile.col !== dest.col;

      if (next && current.tile.value === next.tile.value) {
        nextTiles.push({
          id: current.tile.id,
          value: current.tile.value * 2,
          row: dest.row,
          col: dest.col,
          isMerged: true,
        });
        ghosts.push({
          id: next.tile.id,
          value: next.tile.value,
          row: dest.row,
          col: dest.col,
          fromRow: next.tile.row,
          fromCol: next.tile.col,
        });
        scoreGained += current.tile.value * 2;
        if (movedThisTile || next.tile.row !== dest.row || next.tile.col !== dest.col) {
          moved = true;
        }
        index += 2;
      } else {
        nextTiles.push({
          id: current.tile.id,
          value: current.tile.value,
          row: dest.row,
          col: dest.col,
        });
        if (movedThisTile) {
          moved = true;
        }
        index += 1;
      }
      write += 1;
    }
  }

  return { tiles: nextTiles, ghosts, scoreGained, moved };
}
