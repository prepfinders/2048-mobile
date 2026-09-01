export const palette = {
  background: '#faf8ef',
  text: '#776e65',
  textBright: '#f9f6f2',
  muted: '#bbada0',
  instruction: '#8f7a66',
  logo: '#edc22e',
  scoreBox: '#3d3a37',
  scoreLabel: '#eee4da',
  button: '#f65e3b',
  grid: '#bbada0',
  emptyCell: '#cdc1b4',
  overlay: 'rgba(238, 228, 218, 0.92)',
  overlayDark: '#776e65',
};

export const tileStyles: Record<number, { background: string; color: string }> = {
  2: { background: '#eee4da', color: '#776e65' },
  4: { background: '#ede0c8', color: '#776e65' },
  8: { background: '#f2b179', color: '#f9f6f2' },
  16: { background: '#f59563', color: '#f9f6f2' },
  32: { background: '#f67c5f', color: '#f9f6f2' },
  64: { background: '#f65e3b', color: '#f9f6f2' },
  128: { background: '#edcf72', color: '#f9f6f2' },
  256: { background: '#edcc61', color: '#f9f6f2' },
  512: { background: '#edc850', color: '#f9f6f2' },
  1024: { background: '#edc53f', color: '#f9f6f2' },
  2048: { background: '#edc22e', color: '#f9f6f2' },
  4096: { background: '#3c3a32', color: '#f9f6f2' },
  8192: { background: '#3c3a32', color: '#f9f6f2' },
};

export function tileAppearance(value: number): { background: string; color: string } {
  return tileStyles[value] ?? { background: '#3c3a32', color: '#f9f6f2' };
}
