import SwiftUI
import UIKit

@MainActor
final class GameViewModel: ObservableObject {
    @Published var state: GameState
    private var timer: Timer?

    init() {
        state = GameStore.load() ?? GameLogic.newGame()
        startTimer()
    }

    func move(_ direction: Direction) {
        let current = state
        let next = GameLogic.applyMove(current, direction: direction)
        guard next != current else { return }
        let merged = next.score > current.score
        state = next
        state.elapsedMs = current.elapsedMs
        GameStore.save(state)
        if merged {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        }
        startTimer()
    }

    func newGame() {
        state = GameLogic.newGame(bestScore: state.bestScore)
        GameStore.save(state)
        startTimer()
    }

    func undo() {
        let current = state
        let next = GameLogic.undo(current)
        guard next != current else { return }
        state = next
        state.elapsedMs = current.elapsedMs
        GameStore.save(state)
        startTimer()
    }

    func keepPlaying() {
        state = GameLogic.keepPlaying(state)
        GameStore.save(state)
        startTimer()
    }

    func persist() {
        GameStore.save(state)
    }

    private func startTimer() {
        timer?.invalidate()
        guard !state.over else { return }
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self, !self.state.over else { return }
                self.state.elapsedMs += 1000
            }
        }
    }
}
