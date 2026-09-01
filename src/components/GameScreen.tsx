import { useMemo } from 'react';
import { Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Board } from './Board';
import { Footer } from './Footer';
import { Header } from './Header';
import { Overlay } from './Overlay';
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

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(swipeEnabled)
        .activeOffsetX([-18, 18])
        .activeOffsetY([-18, 18])
        .onEnd((event) => {
          const { translationX, translationY } = event;
          if (Math.max(Math.abs(translationX), Math.abs(translationY)) < 24) {
            return;
          }
          if (Math.abs(translationX) > Math.abs(translationY)) {
            move(translationX > 0 ? 'right' : 'left');
          } else {
            move(translationY > 0 ? 'down' : 'up');
          }
        }),
    [move, swipeEnabled]
  );

  useKeyboard(move, swipeEnabled);

  if (!state) {
    return <View style={styles.root} />;
  }

  const showWin = state.won && !state.wonAcknowledged && !state.over;
  const showOver = state.over;

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
        <GestureDetector gesture={pan}>
          <View>
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
        </GestureDetector>
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
