import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import type { GhostTile, Tile } from '../game/types';
import { palette, tileAppearance } from '../theme/colors';

const GRID_PADDING = 10;
const GAP = 10;

type BoardProps = {
  tiles: Tile[];
  ghosts: GhostTile[];
  size: number;
  overlay?: ReactNode;
};

export function Board({ tiles, ghosts, size, overlay }: BoardProps) {
  const cellSize = (size - GRID_PADDING * 2 - GAP * 3) / 4;

  return (
    <View style={[styles.grid, { width: size, height: size }]}>
      {Array.from({ length: 16 }, (_, index) => (
        <View
          key={index}
          style={[
            styles.empty,
            {
              width: cellSize,
              height: cellSize,
              left: GRID_PADDING + (index % 4) * (cellSize + GAP),
              top: GRID_PADDING + Math.floor(index / 4) * (cellSize + GAP),
            },
          ]}
        />
      ))}
      {ghosts.map((ghost) => (
        <AnimatedTile
          key={`ghost-${ghost.id}`}
          value={ghost.value}
          cellSize={cellSize}
          fromX={GRID_PADDING + ghost.fromCol * (cellSize + GAP)}
          fromY={GRID_PADDING + ghost.fromRow * (cellSize + GAP)}
          toX={GRID_PADDING + ghost.col * (cellSize + GAP)}
          toY={GRID_PADDING + ghost.row * (cellSize + GAP)}
          fadeOut
        />
      ))}
      {tiles.map((tile) => (
        <AnimatedTile
          key={tile.id}
          value={tile.value}
          cellSize={cellSize}
          fromX={GRID_PADDING + tile.col * (cellSize + GAP)}
          fromY={GRID_PADDING + tile.row * (cellSize + GAP)}
          toX={GRID_PADDING + tile.col * (cellSize + GAP)}
          toY={GRID_PADDING + tile.row * (cellSize + GAP)}
          isNew={tile.isNew}
          isMerged={tile.isMerged}
        />
      ))}
      {overlay}
    </View>
  );
}

type AnimatedTileProps = {
  value: number;
  cellSize: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isNew?: boolean;
  isMerged?: boolean;
  fadeOut?: boolean;
};

function AnimatedTile({
  value,
  cellSize,
  fromX,
  fromY,
  toX,
  toY,
  isNew = false,
  isMerged = false,
  fadeOut = false,
}: AnimatedTileProps) {
  const translate = useRef(new Animated.ValueXY({ x: fromX, y: fromY })).current;
  const scale = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const lastTarget = useRef({ x: fromX, y: fromY });
  const { background, color } = tileAppearance(value);
  const fontSize = tileFontSize(value, cellSize);

  useEffect(() => {
    if (lastTarget.current.x === toX && lastTarget.current.y === toY && !fadeOut) {
      return;
    }
    lastTarget.current = { x: toX, y: toY };
    Animated.timing(translate, {
      toValue: { x: toX, y: toY },
      duration: 115,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [toX, toY, fadeOut, translate]);

  useEffect(() => {
    if (isNew) {
      const animation = Animated.sequence([
        Animated.delay(90),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
      ]);
      animation.start();
      return () => animation.stop();
    }

    if (isMerged) {
      const animation = Animated.sequence([
        Animated.timing(scale, { toValue: 1.12, duration: 80, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]);
      animation.start();
      return () => animation.stop();
    }

    return undefined;
  }, [isNew, isMerged, scale]);

  useEffect(() => {
    if (!fadeOut) {
      return;
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: 110,
      delay: 30,
      useNativeDriver: true,
    }).start();
  }, [fadeOut, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.tile,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: background,
          opacity,
          transform: [...translate.getTranslateTransform(), { scale }],
        },
      ]}
    >
      <Text
        style={[
          styles.tileText,
          {
            color,
            fontSize,
          },
        ]}
      >
        {value}
      </Text>
    </Animated.View>
  );
}

function tileFontSize(value: number, cellSize: number): number {
  if (value >= 1024) {
    return cellSize * 0.32;
  }
  if (value >= 128) {
    return cellSize * 0.38;
  }
  return cellSize * 0.46;
}

const styles = StyleSheet.create({
  grid: {
    backgroundColor: palette.grid,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  empty: {
    position: 'absolute',
    backgroundColor: palette.emptyCell,
    borderRadius: 6,
  },
  tile: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    fontWeight: '800',
  },
});
