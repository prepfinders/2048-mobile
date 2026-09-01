package com.prepfinders.native2048

import android.app.Application
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class GameViewModel(application: Application) : AndroidViewModel(application) {
    private val store = GameStore(application)
    private val _state = MutableStateFlow(store.load() ?: GameLogic.newGame())
    val state: StateFlow<GameState> = _state.asStateFlow()
    private var ticker: Job? = null

    init {
        startTimer()
    }

    fun move(direction: Direction) {
        val current = _state.value
        val next = GameLogic.applyMove(current, direction)
        if (next === current || next == current) return
        val merged = next.score > current.score
        commit(next.copy(elapsedMs = current.elapsedMs))
        if (merged) haptic()
        startTimer()
    }

    fun newGame() {
        commit(GameLogic.newGame(_state.value.bestScore))
        startTimer()
    }

    fun undo() {
        val current = _state.value
        val next = GameLogic.undo(current)
        if (next != current) {
            commit(next.copy(elapsedMs = current.elapsedMs))
            startTimer()
        }
    }

    fun keepPlaying() {
        commit(GameLogic.keepPlaying(_state.value))
        startTimer()
    }

    private fun commit(next: GameState) {
        _state.value = next
        store.save(next)
    }

    private fun startTimer() {
        ticker?.cancel()
        if (_state.value.over) return
        ticker = viewModelScope.launch {
            while (isActive) {
                delay(1000)
                val current = _state.value
                if (current.over) break
                val next = current.copy(elapsedMs = current.elapsedMs + 1000)
                _state.value = next
            }
        }
    }

    private fun haptic() {
        val app = getApplication<Application>()
        val vibrator = if (Build.VERSION.SDK_INT >= 31) {
            app.getSystemService(VibratorManager::class.java).defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            app.getSystemService(Vibrator::class.java)
        }
        runCatching {
            vibrator.vibrate(VibrationEffect.createOneShot(30, VibrationEffect.DEFAULT_AMPLITUDE))
        }
    }

    override fun onCleared() {
        store.save(_state.value)
        super.onCleared()
    }
}
