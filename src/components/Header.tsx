import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatScore } from '../game/format';
import { palette } from '../theme/colors';

type HeaderProps = {
  score: number;
  bestScore: number;
  canUndo: boolean;
  onNew: () => void;
  onUndo: () => void;
};

export function Header({ score, bestScore, canUndo, onNew, onUndo }: HeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.logo} accessibilityRole="image" accessibilityLabel="2048">
        <Text style={styles.logoText}>2048</Text>
      </View>
      <View style={styles.controls}>
        <View style={styles.boxes}>
          <ScoreBox label="SCORE" value={score} />
          <ScoreBox label="BEST" value={bestScore} />
        </View>
        <View style={styles.boxes}>
          <ActionButton label="NEW" onPress={onNew} />
          <ActionButton label="UNDO" onPress={onUndo} disabled={!canUndo} />
        </View>
      </View>
    </View>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.scoreBox} accessibilityLabel={`${label} ${value}`}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{formatScore(value)}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  logo: {
    width: 108,
    height: 108,
    borderRadius: 8,
    backgroundColor: palette.logo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: palette.textBright,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  controls: {
    flex: 1,
    gap: 8,
  },
  boxes: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: palette.scoreBox,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 50,
  },
  scoreLabel: {
    color: palette.scoreLabel,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  scoreValue: {
    color: palette.textBright,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  button: {
    flex: 1,
    backgroundColor: palette.button,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: palette.textBright,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
