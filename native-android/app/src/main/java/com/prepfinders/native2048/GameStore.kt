package com.prepfinders.native2048

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

class GameStore(context: Context) {
    private val prefs = context.getSharedPreferences("native2048", Context.MODE_PRIVATE)

    fun load(): GameState? {
        val raw = prefs.getString(KEY, null) ?: return null
        return runCatching { decode(raw) }.getOrNull()
    }

    fun save(state: GameState) {
        prefs.edit().putString(KEY, encode(state)).apply()
    }

    private fun encode(state: GameState): String {
        fun tilesJson(tiles: List<Tile>) = JSONArray().also { array ->
            tiles.forEach { tile ->
                array.put(
                    JSONObject()
                        .put("id", tile.id)
                        .put("value", tile.value)
                        .put("row", tile.row)
                        .put("col", tile.col),
                )
            }
        }
        val history = JSONArray()
        state.history.forEach { snapshot ->
            history.put(
                JSONObject()
                    .put("score", snapshot.score)
                    .put("moves", snapshot.moves)
                    .put("tiles", tilesJson(snapshot.tiles)),
            )
        }
        return JSONObject()
            .put("tiles", tilesJson(state.tiles))
            .put("score", state.score)
            .put("bestScore", state.bestScore)
            .put("moves", state.moves)
            .put("elapsedMs", state.elapsedMs)
            .put("won", state.won)
            .put("wonAcknowledged", state.wonAcknowledged)
            .put("over", state.over)
            .put("history", history)
            .put("nextId", state.nextId)
            .toString()
    }

    private fun decode(raw: String): GameState {
        fun tiles(array: JSONArray): List<Tile> = buildList {
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                add(
                    Tile(
                        id = obj.getInt("id"),
                        value = obj.getInt("value"),
                        row = obj.getInt("row"),
                        col = obj.getInt("col"),
                    ),
                )
            }
        }
        val obj = JSONObject(raw)
        val historyArray = obj.optJSONArray("history") ?: JSONArray()
        val history = buildList {
            for (i in 0 until historyArray.length()) {
                val snap = historyArray.getJSONObject(i)
                add(
                    GameSnapshot(
                        tiles = tiles(snap.getJSONArray("tiles")),
                        score = snap.getInt("score"),
                        moves = snap.getInt("moves"),
                    ),
                )
            }
        }
        val loadedTiles = tiles(obj.getJSONArray("tiles"))
        if (loadedTiles.isEmpty()) {
            return GameLogic.newGame(obj.optInt("bestScore"))
        }
        return GameState(
            tiles = loadedTiles,
            score = obj.optInt("score"),
            bestScore = obj.optInt("bestScore"),
            moves = obj.optInt("moves"),
            elapsedMs = obj.optLong("elapsedMs"),
            won = obj.optBoolean("won"),
            wonAcknowledged = obj.optBoolean("wonAcknowledged"),
            over = obj.optBoolean("over") || !GameLogic.canMove(GameLogic.boardFromTiles(loadedTiles)),
            history = history,
            nextId = obj.optInt("nextId", loadedTiles.maxOf { it.id } + 1),
        )
    }

    companion object {
        private const val KEY = "game"
    }
}
