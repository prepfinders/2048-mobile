import { useMemo, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Board } from './Board';
import { Footer } from './Footer';
import { Header } from './Header';
import { Overlay } from './Overlay';
import { directionFromDelta } from '../game/swipe';
import { useGame } from '../hooks/useGame';
import { directionFromKey, useKeyboard } from '../hooks/useKeyboard';
import { palette } from '../theme/colors';

export function GameScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { state, move, newGame, undo, keepPlaying } = useGame();

  const contentWidth = Math.min(width - 32, 440);
  const availableHeight = height - insets.top - insets.bottom - 220;
  const boardSize = Math.min(contentWidth, Math.max(280, availableHeight));

  const swipeEnabled = !!state && !state.over && !(state.won && !state.wonAcknowledged);

  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(swipeEnabled)
        .minDistance(20)
        .onEnd((event) => {
          const direction = directionFromDelta(event.translationX, event.translationY);
          if (direction) {
            move(direction);
          }
        }),
    [move, swipeEnabled]
  );

  const webSwipeProps =
    Platform.OS === 'web'
      ? {
          onStartShouldSetResponder: () => swipeEnabled,
          onMoveShouldSetResponder: () => swipeEnabled,
          onResponderGrant: (event: GestureResponderEvent) => {
            swipeStart.current = {
              x: event.nativeEvent.pageX,
              y: event.nativeEvent.pageY,
            };
          },
          onResponderRelease: (event: GestureResponderEvent) => {
            if (!swipeStart.current || !swipeEnabled) {
              return;
            }
            const direction = directionFromDelta(
              event.nativeEvent.pageX - swipeStart.current.x,
              event.nativeEvent.pageY - swipeStart.current.y
            );
            swipeStart.current = null;
            if (direction) {
              move(direction);
            }
          },
        }
      : {};

  useKeyboard(move, swipeEnabled);

  if (!state) {
    return <View style={styles.root} />;
  }

  const showWin = state.won && !state.wonAcknowledged && !state.over;
  const showOver = state.over;
  const board = (
    <View {...webSwipeProps}>
      <Board
        tiles={state.tiles}
        ghosts={state.ghosts}
        size={boardSize}
        overlay={
          showWin ? (
            <Overlay
              title="You win!"
              subtitle="You made a 2048 tile."
              primaryLabel="Keep going"
              onPrimary={keepPlaying}
              secondaryLabel="New game"
              onSecondary={newGame}
            />
          ) : showOver ? (
            <Overlay
              title="Game over!"
              subtitle="No moves left."
              primaryLabel="Try again"
              onPrimary={newGame}
              secondaryLabel={state.history.length > 0 ? 'Undo' : undefined}
              onSecondary={state.history.length > 0 ? undo : undefined}
            />
          ) : null
        }
      />
    </View>
  );

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <View style={[styles.content, { width: contentWidth }]}>
        <Header
          score={state.score}
          bestScore={state.bestScore}
          canUndo={state.history.length > 0}
          onNew={newGame}
          onUndo={undo}
        />
        <Text style={styles.instruction}>Join the numbers and get to the 2048 tile!</Text>
        {Platform.OS === 'web' ? board : <GestureDetector gesture={pan}>{board}</GestureDetector>}
        <Footer moves={state.moves} elapsedMs={state.elapsedMs} />
      </View>
      {Platform.OS !== 'web' ? (
        <TextInput
          accessible={false}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          caretHidden
          importantForAccessibility="no"
          showSoftInputOnFocus={false}
          style={styles.hiddenInput}
          value=""
          onKeyPress={(event) => {
            if (!swipeEnabled) {
              return;
            }
            const direction = directionFromKey(event.nativeEvent.key);
            if (direction) {
              move(direction);
            }
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  content: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  instruction: {
    color: palette.instruction,
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 18,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
});
