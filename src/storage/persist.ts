import AsyncStorage from '@react-native-async-storage/async-storage';

import { restoreGame } from '../game/engine';
import type { GameSnapshot, GameState, Tile } from '../game/types';

const STORAGE_KEY = 'game2048:v1';

type PersistedGame = {
  tiles: Tile[];
  score: number;
  bestScore: number;
  moves: number;
  elapsedMs: number;
  won: boolean;
  wonAcknowledged: boolean;
  over: boolean;
  history: GameSnapshot[];
  savedAt: number;
};

export async function loadPersistedGame(): Promise<{ state: GameState | null; bestScore: number }> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { state: null, bestScore: 0 };
    }

    const parsed = JSON.parse(raw) as PersistedGame;
    const bestScore = typeof parsed.bestScore === 'number' ? parsed.bestScore : 0;

    if (!Array.isArray(parsed.tiles) || parsed.tiles.length === 0) {
      return { state: null, bestScore };
    }

    const state = restoreGame({
      tiles: parsed.tiles,
      score: parsed.score ?? 0,
      bestScore,
      moves: parsed.moves ?? 0,
      elapsedMs: parsed.elapsedMs ?? 0,
      won: parsed.won ?? false,
      wonAcknowledged: parsed.wonAcknowledged ?? false,
      over: parsed.over ?? false,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    });

    return { state, bestScore };
  } catch {
    return { state: null, bestScore: 0 };
  }
}

export async function persistGame(state: GameState): Promise<void> {
  const payload: PersistedGame = {
    tiles: state.tiles.map((tile) => ({
      id: tile.id,
      value: tile.value,
      row: tile.row,
      col: tile.col,
    })),
    score: state.score,
    bestScore: state.bestScore,
    moves: state.moves,
    elapsedMs: state.elapsedMs,
    won: state.won,
    wonAcknowledged: state.wonAcknowledged,
    over: state.over,
    history: state.history,
    savedAt: Date.now(),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
