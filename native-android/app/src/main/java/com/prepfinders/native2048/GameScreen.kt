package com.prepfinders.native2048

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.clickable

@Composable
fun GameScreen(
    state: GameState,
    onMove: (Direction) -> Unit,
    onNew: () -> Unit,
    onUndo: () -> Unit,
    onKeepPlaying: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Palette.background)
            .statusBarsPadding()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Header(state, onNew, onUndo)
        Text(
            text = "Join the numbers and get to the 2048 tile!",
            color = Palette.instruction,
            fontSize = 15.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(vertical = 18.dp),
        )
        Board(state, onMove, onNew, onUndo, onKeepPlaying)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(GameLogic.formatMoves(state.moves), color = Palette.muted, fontSize = 14.sp)
            Text(GameLogic.formatTime(state.elapsedMs), color = Palette.muted, fontSize = 14.sp)
        }
    }
}

@Composable
private fun Header(state: GameState, onNew: () -> Unit, onUndo: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(108.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Palette.logo),
            contentAlignment = Alignment.Center,
        ) {
            Text("2048", color = Palette.textBright, fontSize = 34.sp, fontWeight = FontWeight.ExtraBold)
        }
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ScoreBox("SCORE", state.score, Modifier.weight(1f))
                ScoreBox("BEST", state.bestScore, Modifier.weight(1f))
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ActionButton("NEW", onNew, Modifier.weight(1f))
                ActionButton("UNDO", onUndo, Modifier.weight(1f), enabled = state.canUndo)
            }
        }
    }
}

@Composable
private fun ScoreBox(label: String, value: Int, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .height(50.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(Palette.scoreBox),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(label, color = Palette.scoreLabel, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Text(GameLogic.formatScore(value), color = Palette.textBright, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
    }
}

@Composable
private fun ActionButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Box(
        modifier = modifier
            .height(44.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(Palette.button.copy(alpha = if (enabled) 1f else 0.4f))
            .clickable(enabled = enabled, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(label, color = Palette.textBright, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold)
    }
}

@Composable
private fun Board(
    state: GameState,
    onMove: (Direction) -> Unit,
    onNew: () -> Unit,
    onUndo: () -> Unit,
    onKeepPlaying: () -> Unit,
) {
    val swipeEnabled = !state.over && !state.showWin
    var drag by remember { mutableStateOf(Offset.Zero) }

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clip(RoundedCornerShape(8.dp))
            .background(Palette.grid)
            .padding(10.dp)
            .pointerInput(swipeEnabled) {
                if (!swipeEnabled) return@pointerInput
                detectDragGestures(
                    onDragStart = { drag = Offset.Zero },
                    onDrag = { change, amount ->
                        change.consume()
                        drag += amount
                    },
                    onDragEnd = {
                        GameLogic.directionFromDelta(drag.x, drag.y, minDistance = 36f)?.let(onMove)
                    },
                )
            },
    ) {
        val gap = 10.dp
        val cell = (minOf(maxWidth, maxHeight) - gap * 3) / 4

        for (row in 0 until 4) {
            for (col in 0 until 4) {
                Box(
                    modifier = Modifier
                        .size(cell)
                        .offset(x = (cell + gap) * col, y = (cell + gap) * row)
                        .clip(RoundedCornerShape(6.dp))
                        .background(Palette.emptyCell),
                )
            }
        }

        state.tiles.forEach { tile ->
            val x by animateDpAsState((cell + gap) * tile.col, tween(115), label = "x${tile.id}")
            val y by animateDpAsState((cell + gap) * tile.row, tween(115), label = "y${tile.id}")
            val scale by animateFloatAsState(
                targetValue = if (tile.isNew) 1f else 1f,
                animationSpec = tween(if (tile.isNew) 160 else 80),
                label = "s${tile.id}",
            )
            val (bg, fg) = tileColors(tile.value)
            val font = when {
                tile.value >= 1024 -> cell.value * 0.32f
                tile.value >= 128 -> cell.value * 0.38f
                else -> cell.value * 0.42f
            }
            Box(
                modifier = Modifier
                    .size(cell)
                    .offset(x, y)
                    .scale(if (tile.isMerged) 1.06f else if (tile.isNew) 0.92f + 0.08f * scale else 1f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(bg),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = tile.value.toString(),
                    color = fg,
                    fontSize = font.sp,
                    fontWeight = FontWeight.ExtraBold,
                )
            }
        }

        if (state.showWin) {
            Overlay("You win!", "You made a 2048 tile.", "Keep going", onKeepPlaying, "New game", onNew)
        } else if (state.over) {
            Overlay(
                "Game over!",
                "No moves left.",
                "Try again",
                onNew,
                if (state.canUndo) "Undo" else null,
                if (state.canUndo) onUndo else null,
            )
        }
    }
}

@Composable
private fun Overlay(
    title: String,
    subtitle: String,
    primary: String,
    onPrimary: () -> Unit,
    secondary: String?,
    onSecondary: (() -> Unit)?,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Palette.overlay),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(title, color = Palette.overlayDark, fontSize = 42.sp, fontWeight = FontWeight.ExtraBold)
        Text(subtitle, color = Palette.instruction, fontSize = 16.sp, modifier = Modifier.padding(bottom = 12.dp))
        ActionButton(primary, onPrimary, Modifier.width(160.dp))
        if (secondary != null && onSecondary != null) {
            Spacer(Modifier.height(10.dp))
            ActionButton(secondary, onSecondary, Modifier.width(160.dp))
        }
    }
}
