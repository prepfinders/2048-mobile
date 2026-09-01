package com.prepfinders.native2048

enum class Direction { LEFT, RIGHT, UP, DOWN }

data class Tile(
    val id: Int,
    val value: Int,
    val row: Int,
    val col: Int,
    val isNew: Boolean = false,
    val isMerged: Boolean = false,
)

data class GameSnapshot(
    val tiles: List<Tile>,
    val score: Int,
    val moves: Int,
)

data class GameState(
    val tiles: List<Tile>,
    val score: Int = 0,
    val bestScore: Int = 0,
    val moves: Int = 0,
    val elapsedMs: Long = 0,
    val won: Boolean = false,
    val wonAcknowledged: Boolean = false,
    val over: Boolean = false,
    val history: List<GameSnapshot> = emptyList(),
    val nextId: Int = 1,
) {
    val canUndo: Boolean get() = history.isNotEmpty()
    val showWin: Boolean get() = won && !wonAcknowledged && !over
}

object GameLogic {
    const val SIZE = 4
    private const val MAX_HISTORY = 20

    fun emptyBoard(): Array<IntArray> = Array(SIZE) { IntArray(SIZE) }

    fun boardFromTiles(tiles: List<Tile>): Array<IntArray> {
        val board = emptyBoard()
        tiles.forEach { board[it.row][it.col] = it.value }
        return board
    }

    fun emptyCells(board: Array<IntArray>): List<Pair<Int, Int>> {
        val cells = mutableListOf<Pair<Int, Int>>()
        for (row in 0 until SIZE) {
            for (col in 0 until SIZE) {
                if (board[row][col] == 0) cells += row to col
            }
        }
        return cells
    }

    fun slideAndMergeLine(line: List<Int>): Triple<List<Int>, Int, Boolean> {
        val compact = line.filter { it != 0 }
        val merged = mutableListOf<Int>()
        var score = 0
        var index = 0
        while (index < compact.size) {
            if (index + 1 < compact.size && compact[index] == compact[index + 1]) {
                val value = compact[index] * 2
                merged += value
                score += value
                index += 2
            } else {
                merged += compact[index]
                index += 1
            }
        }
        while (merged.size < SIZE) merged += 0
        val moved = merged.indices.any { merged[it] != line[it] }
        return Triple(merged, score, moved)
    }

    private fun lineCoordinates(lineIndex: Int, direction: Direction): List<Pair<Int, Int>> =
        (0 until SIZE).map { slot ->
            when (direction) {
                Direction.LEFT -> lineIndex to slot
                Direction.RIGHT -> lineIndex to (SIZE - 1 - slot)
                Direction.UP -> slot to lineIndex
                Direction.DOWN -> (SIZE - 1 - slot) to lineIndex
            }
        }

    fun canMove(board: Array<IntArray>): Boolean {
        if (emptyCells(board).isNotEmpty()) return true
        for (row in 0 until SIZE) {
            for (col in 0 until SIZE) {
                val value = board[row][col]
                if (col + 1 < SIZE && board[row][col + 1] == value) return true
                if (row + 1 < SIZE && board[row + 1][col] == value) return true
            }
        }
        return false
    }

    fun hasWinningTile(board: Array<IntArray>): Boolean =
        board.any { row -> row.any { it >= 2048 } }

    fun spawnTile(
        board: Array<IntArray>,
        random: () -> Double = { Math.random() },
    ): Pair<Array<IntArray>, Triple<Int, Int, Int>?> {
        val empty = emptyCells(board)
        if (empty.isEmpty()) return board to null
        val index = minOf(empty.lastIndex, kotlin.math.floor(random() * empty.size).toInt())
        val (row, col) = empty[index]
        val value = if (random() < 0.9) 2 else 4
        val next = board.map { it.copyOf() }.toTypedArray()
        next[row][col] = value
        return next to Triple(row, col, value)
    }

    fun slideTiles(tiles: List<Tile>, direction: Direction): Triple<List<Tile>, Int, Boolean> {
        val grid = Array(SIZE) { arrayOfNulls<Tile>(SIZE) }
        tiles.forEach { grid[it.row][it.col] = it }

        val nextTiles = mutableListOf<Tile>()
        var scoreGained = 0
        var moved = false

        for (lineIndex in 0 until SIZE) {
            val coords = lineCoordinates(lineIndex, direction)
            val compact = coords.mapNotNull { (row, col) -> grid[row][col] }
            var write = 0
            var index = 0
            while (index < compact.size) {
                val current = compact[index]
                val next = compact.getOrNull(index + 1)
                val (destRow, destCol) = coords[write]
                val movedThis = current.row != destRow || current.col != destCol
                if (next != null && current.value == next.value) {
                    nextTiles += Tile(current.id, current.value * 2, destRow, destCol, isMerged = true)
                    scoreGained += current.value * 2
                    if (movedThis || next.row != destRow || next.col != destCol) moved = true
                    index += 2
                } else {
                    nextTiles += Tile(current.id, current.value, destRow, destCol)
                    if (movedThis) moved = true
                    index += 1
                }
                write += 1
            }
        }
        return Triple(nextTiles, scoreGained, moved)
    }

    fun tilesFromBoard(board: Array<IntArray>, nextId: Int, isNew: Boolean = false): Pair<List<Tile>, Int> {
        val tiles = mutableListOf<Tile>()
        var id = nextId
        for (row in 0 until SIZE) {
            for (col in 0 until SIZE) {
                val value = board[row][col]
                if (value > 0) {
                    tiles += Tile(id, value, row, col, isNew = isNew)
                    id += 1
                }
            }
        }
        return tiles to id
    }

    fun newGame(bestScore: Int = 0, random: () -> Double = { Math.random() }): GameState {
        var board = emptyBoard()
        board = spawnTile(board, random).first
        board = spawnTile(board, random).first
        val (tiles, nextId) = tilesFromBoard(board, 1, isNew = true)
        return GameState(tiles = tiles, bestScore = bestScore, nextId = nextId)
    }

    fun applyMove(state: GameState, direction: Direction, random: () -> Double = { Math.random() }): GameState {
        if (state.over || (state.won && !state.wonAcknowledged)) return state
        val (slidTiles, scoreGained, moved) = slideTiles(state.tiles, direction)
        if (!moved) return state
        val snapshot = GameSnapshot(
            tiles = state.tiles.map { it.copy(isNew = false, isMerged = false) },
            score = state.score,
            moves = state.moves,
        )
        val spawned = spawnTile(boardFromTiles(slidTiles), random)
        val tiles = slidTiles.map { it.copy(isNew = false) }.toMutableList()
        var nextId = state.nextId
        spawned.second?.let { (row, col, value) ->
            tiles += Tile(nextId, value, row, col, isNew = true)
            nextId += 1
        }
        val board = boardFromTiles(tiles)
        val score = state.score + scoreGained
        return state.copy(
            tiles = tiles,
            score = score,
            bestScore = maxOf(state.bestScore, score),
            moves = state.moves + 1,
            won = state.won || hasWinningTile(board),
            over = !canMove(board),
            history = (state.history + snapshot).takeLast(MAX_HISTORY),
            nextId = nextId,
        )
    }

    fun undo(state: GameState): GameState {
        val previous = state.history.lastOrNull() ?: return state
        val tiles = previous.tiles.map { it.copy(isNew = false, isMerged = false) }
        val board = boardFromTiles(tiles)
        val won = hasWinningTile(board)
        return state.copy(
            tiles = tiles,
            score = previous.score,
            moves = previous.moves,
            won = won,
            wonAcknowledged = if (won) state.wonAcknowledged else false,
            over = !canMove(board),
            history = state.history.dropLast(1),
        )
    }

    fun keepPlaying(state: GameState): GameState =
        if (state.won && !state.wonAcknowledged) state.copy(wonAcknowledged = true) else state

    fun formatScore(value: Int): String = when {
        value < 10_000 -> value.toString()
        value < 1_000_000 -> {
            val thousands = kotlin.math.round(value / 100.0) / 10.0
            val text = if (thousands % 1.0 == 0.0) thousands.toInt().toString() else thousands.toString()
            "${text}k"
        }
        else -> {
            val millions = kotlin.math.round(value / 100_000.0) / 10.0
            val text = if (millions % 1.0 == 0.0) millions.toInt().toString() else millions.toString()
            "${text}m"
        }
    }

    fun formatTime(elapsedMs: Long): String {
        val totalSeconds = maxOf(0L, elapsedMs / 1000)
        val minutes = totalSeconds / 60
        val seconds = totalSeconds % 60
        return "$minutes:${seconds.toString().padStart(2, '0')}"
    }

    fun formatMoves(moves: Int): String = if (moves == 1) "1 move" else "$moves moves"

    fun directionFromDelta(dx: Float, dy: Float, minDistance: Float = 24f): Direction? {
        if (maxOf(kotlin.math.abs(dx), kotlin.math.abs(dy)) < minDistance) return null
        return if (kotlin.math.abs(dx) > kotlin.math.abs(dy)) {
            if (dx > 0) Direction.RIGHT else Direction.LEFT
        } else {
            if (dy > 0) Direction.DOWN else Direction.UP
        }
    }
}
