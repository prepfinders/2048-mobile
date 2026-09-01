import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { applyMove, acknowledgeWin, createNewGame, restartGame, undoMove } from '../game/engine';
import type { Direction, GameState } from '../game/types';
import { loadPersistedGame, persistGame } from '../storage/persist';
import { hapticMerge } from '../utils/haptics';

export function useGame() {
  const [state, setState] = useState<GameState | null>(null);
  const stateRef = useRef<GameState | null>(null);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { state: saved, bestScore } = await loadPersistedGame();
      if (!cancelled) {
        setState(saved ?? createNewGame(bestScore));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state || state.over) {
      return;
    }

    const interval = setInterval(() => {
      setState((current) => {
        if (!current || current.over) {
          return current;
        }
        const next = { ...current, elapsedMs: current.elapsedMs + 1000 };
        stateRef.current = next;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state?.over, state == null]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      if (status !== 'active' && stateRef.current) {
        persistGame(stateRef.current).catch(() => undefined);
      }
    });
    return () => sub.remove();
  }, []);

  const commit = useCallback((next: GameState) => {
    stateRef.current = next;
    setState(next);
    persistGame(next).catch(() => undefined);
  }, []);

  const move = useCallback(
    (direction: Direction) => {
      const current = stateRef.current;
      if (!current) {
        return;
      }
      const next = applyMove(current, direction);
      if (next === current) {
        return;
      }
      commit({ ...next, elapsedMs: current.elapsedMs });
      if (next.score > current.score) {
        hapticMerge();
      }
    },
    [commit]
  );

  const newGame = useCallback(() => {
    const current = stateRef.current;
    commit(restartGame(current ?? createNewGame()));
  }, [commit]);

  const undo = useCallback(() => {
    const current = stateRef.current;
    if (!current) {
      return;
    }
    const next = undoMove(current);
    if (next !== current) {
      commit({ ...next, elapsedMs: current.elapsedMs });
    }
  }, [commit]);

  const keepPlaying = useCallback(() => {
    const current = stateRef.current;
    if (!current) {
      return;
    }
    commit(acknowledgeWin(current));
  }, [commit]);

  return {
    state,
    move,
    newGame,
    undo,
    keepPlaying,
  };
}
