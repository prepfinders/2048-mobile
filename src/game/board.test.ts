import { getEmptyCells, moveBoard, slideAndMergeLine, spawnTile } from './board';
import { applyMove, createGameFromBoard, createNewGame, undoMove } from './engine';

describe('slideAndMergeLine', () => {
  it('slides tiles across empty cells', () => {
    expect(slideAndMergeLine([0, 2, 0, 2])).toEqual({
      line: [4, 0, 0, 0],
      score: 4,
      moved: true,
    });
    expect(slideAndMergeLine([2, 0, 0, 0])).toEqual({
      line: [2, 0, 0, 0],
      score: 0,
      moved: false,
    });
    expect(slideAndMergeLine([0, 0, 0, 4])).toEqual({
      line: [4, 0, 0, 0],
      score: 0,
      moved: true,
    });
  });

  it('merges equal tiles only once per move (no double-merge chain)', () => {
    expect(slideAndMergeLine([2, 2, 2, 2])).toEqual({
      line: [4, 4, 0, 0],
      score: 8,
      moved: true,
    });
    expect(slideAndMergeLine([2, 2, 4, 0])).toEqual({
      line: [4, 4, 0, 0],
      score: 4,
      moved: true,
    });
    expect(slideAndMergeLine([4, 2, 2, 0])).toEqual({
      line: [4, 4, 0, 0],
      score: 4,
      moved: true,
    });
    expect(slideAndMergeLine([2, 2, 4, 4])).toEqual({
      line: [4, 8, 0, 0],
      score: 12,
      moved: true,
    });
  });
});

describe('moveBoard', () => {
  it('slides the whole board in each direction', () => {
    const board = [
      [2, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    expect(moveBoard(board, 'left').board[0]).toEqual([4, 0, 0, 0]);
    expect(moveBoard(board, 'right').board[0]).toEqual([0, 0, 0, 4]);
    expect(moveBoard(board, 'down').board[3]).toEqual([2, 0, 0, 2]);
  });
});

describe('spawn after move', () => {
  it('spawns a 2 or 4 on a random empty cell after a successful move', () => {
    const start = createGameFromBoard([
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    const randomValues = [0, 0.5];
    let cursor = 0;
    const random = () => randomValues[cursor++] ?? 0;

    const next = applyMove(start, 'right', random);
    const filled = next.tiles.filter((tile) => tile.value > 0);

    expect(next.moves).toBe(1);
    expect(filled).toHaveLength(2);
    expect(filled.some((tile) => tile.row === 0 && tile.col === 3 && tile.value === 2)).toBe(true);
    expect(filled.some((tile) => tile.isNew && tile.value === 2)).toBe(true);
    expect(getEmptyCells([
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]).length).toBe(15);
  });

  it('does not spawn when the swipe does not change the board', () => {
    const start = createGameFromBoard([
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    const next = applyMove(start, 'right', () => {
      throw new Error('spawn rng should not run');
    });

    expect(next.tiles).toHaveLength(1);
    expect(next.moves).toBe(0);
    expect(next.score).toBe(0);
  });

  it('uses 90% twos and 10% fours when spawning', () => {
    const board = [
      [2, 2, 2, 2],
      [2, 2, 2, 2],
      [2, 2, 2, 2],
      [2, 2, 2, 0],
    ];

    const two = spawnTile(board, (() => {
      let i = 0;
      return () => (i++ === 0 ? 0 : 0.89);
    })());
    expect(two.spawned?.value).toBe(2);

    const four = spawnTile(board, (() => {
      let i = 0;
      return () => (i++ === 0 ? 0 : 0.9);
    })());
    expect(four.spawned?.value).toBe(4);
  });
});

describe('undo', () => {
  it('reverts the last move including board, score, and move count', () => {
    const start = createGameFromBoard(
      [
        [2, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      { score: 10, moves: 3 }
    );

    const moved = applyMove(start, 'left', () => 0);
    expect(moved.score).toBe(14);
    expect(moved.moves).toBe(4);
    expect(moved.tiles.some((tile) => tile.value === 4)).toBe(true);

    const undone = undoMove(moved);
    expect(undone.score).toBe(10);
    expect(undone.moves).toBe(3);
    expect(undone.tiles).toHaveLength(2);
    expect(undone.tiles.every((tile) => tile.value === 2)).toBe(true);
    expect(undone.history).toHaveLength(0);
  });

  it('is a no-op when there is nothing to undo', () => {
    const start = createNewGame(0, () => 0);
    expect(undoMove(start)).toEqual(start);
  });
});

describe('createNewGame', () => {
  it('starts with two random tiles', () => {
    const game = createNewGame(99, () => 0);
    expect(game.tiles).toHaveLength(2);
    expect(game.score).toBe(0);
    expect(game.moves).toBe(0);
    expect(game.bestScore).toBe(99);
    expect(game.tiles.every((tile) => tile.value === 2 || tile.value === 4)).toBe(true);
  });
});

describe('win and game over', () => {
  it('wins when a 2048 tile is first created', () => {
    const start = createGameFromBoard([
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const next = applyMove(start, 'left', () => 0);
    expect(next.won).toBe(true);
    expect(next.tiles.some((tile) => tile.value === 2048)).toBe(true);
  });

  it('is over when the board is full and nothing can merge', () => {
    const start = createGameFromBoard([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2, 4],
      [8, 16, 32, 64],
    ]);
    expect(start.over).toBe(true);
  });
});
