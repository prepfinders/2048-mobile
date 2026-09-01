import type { Direction } from '../game/types';

export function directionFromDelta(dx: number, dy: number, minDistance = 24): Direction | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < minDistance) {
    return null;
  }
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}
