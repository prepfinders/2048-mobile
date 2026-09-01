package com.prepfinders.native2048

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GameLogicTest {
    @Test
    fun slidesAcrossEmptyCells() {
        val (line, score, moved) = GameLogic.slideAndMergeLine(listOf(0, 2, 0, 2))
        assertEquals(listOf(4, 0, 0, 0), line)
        assertEquals(4, score)
        assertTrue(moved)
    }

    @Test
    fun doubleMergeDoesNotChain() {
        val (line, score, _) = GameLogic.slideAndMergeLine(listOf(2, 2, 2, 2))
        assertEquals(listOf(4, 4, 0, 0), line)
        assertEquals(8, score)

        val (line2, score2, _) = GameLogic.slideAndMergeLine(listOf(2, 2, 4, 0))
        assertEquals(listOf(4, 4, 0, 0), line2)
        assertEquals(4, score2)
    }

    @Test
    fun spawnAfterSuccessfulMove() {
        val start = GameLogic.newGame(0) { 0.0 }
        val withOne = start.copy(
            tiles = listOf(Tile(1, 2, 0, 0)),
            nextId = 2,
        )
        var calls = 0
        val random = {
            calls += 1
            if (calls == 1) 0.0 else 0.5
        }
        val next = GameLogic.applyMove(withOne, Direction.RIGHT, random)
        assertEquals(1, next.moves)
        assertEquals(2, next.tiles.size)
        assertTrue(next.tiles.any { it.row == 0 && it.col == 3 && it.value == 2 })
        assertTrue(next.tiles.any { it.isNew })
    }

    @Test
    fun noSpawnWhenMoveDoesNothing() {
        val start = GameLogic.newGame(0) { 0.0 }.copy(
            tiles = listOf(Tile(1, 2, 0, 3)),
            nextId = 2,
        )
        val next = GameLogic.applyMove(start, Direction.RIGHT) { error("rng") }
        assertEquals(0, next.moves)
        assertEquals(1, next.tiles.size)
    }

    @Test
    fun undoRestoresBoardScoreAndMoves() {
        val start = GameLogic.newGame(0) { 0.0 }.copy(
            tiles = listOf(Tile(1, 2, 0, 0), Tile(2, 2, 0, 1)),
            score = 10,
            moves = 3,
            nextId = 3,
        )
        val moved = GameLogic.applyMove(start, Direction.LEFT) { 0.0 }
        assertEquals(14, moved.score)
        assertEquals(4, moved.moves)
        val undone = GameLogic.undo(moved)
        assertEquals(10, undone.score)
        assertEquals(3, undone.moves)
        assertEquals(2, undone.tiles.size)
        assertTrue(undone.tiles.all { it.value == 2 })
    }

    @Test
    fun winsAt2048() {
        val start = GameLogic.newGame(0) { 0.0 }.copy(
            tiles = listOf(Tile(1, 1024, 0, 0), Tile(2, 1024, 0, 1)),
            nextId = 3,
        )
        val next = GameLogic.applyMove(start, Direction.LEFT) { 0.0 }
        assertTrue(next.won)
        assertTrue(next.tiles.any { it.value == 2048 })
    }

    @Test
    fun gameOverWhenFullAndNoMerges() {
        val board = arrayOf(
            intArrayOf(2, 4, 8, 16),
            intArrayOf(32, 64, 128, 256),
            intArrayOf(512, 1024, 2, 4),
            intArrayOf(8, 16, 32, 64),
        )
        assertFalse(GameLogic.canMove(board))
    }
}
