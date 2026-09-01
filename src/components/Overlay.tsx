import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '../theme/colors';

type OverlayProps = {
  title: string;
  subtitle?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function Overlay({
  title,
  subtitle,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: OverlayProps) {
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={onPrimary}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>{primaryLabel}</Text>
      </Pressable>
      {secondaryLabel && onSecondary ? (
        <Pressable
          accessibilityRole="button"
          onPress={onSecondary}
          style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: palette.overlay,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  title: {
    color: palette.overlayDark,
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: palette.instruction,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 6,
  },
  button: {
    backgroundColor: palette.button,
    borderRadius: 6,
    paddingHorizontal: 22,
    paddingVertical: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: palette.scoreBox,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: palette.textBright,
    fontSize: 16,
    fontWeight: '800',
  },
});
