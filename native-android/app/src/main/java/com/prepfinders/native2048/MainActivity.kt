package com.prepfinders.native2048

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle

class MainActivity : ComponentActivity() {
    private val viewModel: GameViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val state by viewModel.state.collectAsStateWithLifecycle()
            GameScreen(
                state = state,
                onMove = viewModel::move,
                onNew = viewModel::newGame,
                onUndo = viewModel::undo,
                onKeepPlaying = viewModel::keepPlaying,
            )
        }
    }

    override fun onPause() {
        super.onPause()
        GameStore(this).save(viewModel.state.value)
    }
}
