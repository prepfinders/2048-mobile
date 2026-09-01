export function formatScore(value: number): string {
  if (value < 10_000) {
    return String(value);
  }
  if (value < 1_000_000) {
    const thousands = value / 1000;
    const rounded = Math.round(thousands * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}k`;
  }
  const millions = value / 1_000_000;
  const rounded = Math.round(millions * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}m`;
}

export function formatTime(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatMoves(moves: number): string {
  return `${moves} ${moves === 1 ? 'move' : 'moves'}`;
}
