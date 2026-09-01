import { useEffect } from 'react';
import { Platform } from 'react-native';

import type { Direction } from '../game/types';

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
  W: 'up',
  A: 'left',
  S: 'down',
  D: 'right',
};

export function useKeyboard(onMove: (direction: Direction) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || Platform.OS !== 'web') {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.key];
      if (!direction) {
        return;
      }
      event.preventDefault();
      onMove(direction);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onMove]);
}

export function directionFromKey(key: string): Direction | null {
  return KEY_TO_DIRECTION[key] ?? null;
}
