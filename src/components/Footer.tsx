import { StyleSheet, Text, View } from 'react-native';

import { formatMoves, formatTime } from '../game/format';
import { palette } from '../theme/colors';

export function Footer({ moves, elapsedMs }: { moves: number; elapsedMs: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{formatMoves(moves)}</Text>
      <Text style={styles.text}>{formatTime(elapsedMs)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 2,
  },
  text: {
    color: palette.muted,
    fontSize: 14,
  },
});
