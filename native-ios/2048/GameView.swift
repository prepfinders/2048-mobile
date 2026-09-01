import SwiftUI

struct GameView: View {
    @StateObject private var model = GameViewModel()
    @State private var drag: CGSize = .zero

    var body: some View {
        VStack(spacing: 0) {
            header
            Text("Join the numbers and get to the 2048 tile!")
                .font(.system(size: 15))
                .foregroundStyle(Palette.instruction)
                .multilineTextAlignment(.center)
                .padding(.vertical, 18)
            board
            HStack {
                Text(GameLogic.formatMoves(model.state.moves))
                Spacer()
                Text(GameLogic.formatTime(model.state.elapsedMs))
            }
            .font(.system(size: 14))
            .foregroundStyle(Palette.muted)
            .padding(.top, 12)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
        .padding(.bottom, 16)
        .frame(maxWidth: 440)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Palette.background.ignoresSafeArea())
        .onDisappear { model.persist() }
    }

    private var header: some View {
        HStack(alignment: .center, spacing: 12) {
            Text("2048")
                .font(.system(size: 34, weight: .heavy))
                .foregroundStyle(Palette.textBright)
                .frame(width: 108, height: 108)
                .background(Palette.logo, in: RoundedRectangle(cornerRadius: 8))
            VStack(spacing: 8) {
                HStack(spacing: 8) {
                    scoreBox("SCORE", model.state.score)
                    scoreBox("BEST", model.state.bestScore)
                }
                HStack(spacing: 8) {
                    actionButton("NEW", enabled: true, action: model.newGame)
                    actionButton("UNDO", enabled: model.state.canUndo, action: model.undo)
                }
            }
        }
    }

    private func scoreBox(_ label: String, _ value: Int) -> some View {
        VStack(spacing: 2) {
            Text(label)
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(Palette.scoreLabel)
            Text(GameLogic.formatScore(value))
                .font(.system(size: 20, weight: .heavy))
                .foregroundStyle(Palette.textBright)
        }
        .frame(maxWidth: .infinity, minHeight: 50)
        .background(Palette.scoreBox, in: RoundedRectangle(cornerRadius: 6))
    }

    private func actionButton(_ label: String, enabled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 15, weight: .heavy))
                .foregroundStyle(Palette.textBright)
                .frame(maxWidth: .infinity, minHeight: 44)
                .background(Palette.button.opacity(enabled ? 1 : 0.4), in: RoundedRectangle(cornerRadius: 6))
        }
        .disabled(!enabled)
        .buttonStyle(.plain)
    }

    private var board: some View {
        GeometryReader { geo in
            let gap: CGFloat = 10
            let cell = (geo.size.width - gap * 3) / 4
            let swipeEnabled = !model.state.over && !model.state.showWin
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 8).fill(Palette.grid)
                ForEach(0..<16, id: \.self) { index in
                    let row = index / 4
                    let col = index % 4
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Palette.emptyCell)
                        .frame(width: cell, height: cell)
                        .offset(x: 10 + CGFloat(col) * (cell + gap), y: 10 + CGFloat(row) * (cell + gap))
                }
                ForEach(model.state.tiles) { tile in
                    let colors = Palette.tile(tile.value)
                    Text("\(tile.value)")
                        .font(.system(size: tile.value >= 1024 ? cell * 0.32 : tile.value >= 128 ? cell * 0.38 : cell * 0.42, weight: .heavy))
                        .foregroundStyle(colors.1)
                        .frame(width: cell, height: cell)
                        .background(colors.0, in: RoundedRectangle(cornerRadius: 6))
                        .scaleEffect(tile.isMerged ? 1.08 : tile.isNew ? 0.92 : 1)
                        .offset(x: 10 + CGFloat(tile.col) * (cell + gap), y: 10 + CGFloat(tile.row) * (cell + gap))
                        .animation(.easeOut(duration: 0.12), value: tile.row)
                        .animation(.easeOut(duration: 0.12), value: tile.col)
                }
                if model.state.showWin {
                    overlay(
                        title: "You win!",
                        subtitle: "You made a 2048 tile.",
                        primary: "Keep going",
                        primaryAction: model.keepPlaying,
                        secondary: "New game",
                        secondaryAction: model.newGame
                    )
                } else if model.state.over {
                    overlay(
                        title: "Game over!",
                        subtitle: "No moves left.",
                        primary: "Try again",
                        primaryAction: model.newGame,
                        secondary: model.state.canUndo ? "Undo" : nil,
                        secondaryAction: model.state.canUndo ? model.undo : nil
                    )
                }
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 20)
                    .onChanged { value in
                        if swipeEnabled { drag = value.translation }
                    }
                    .onEnded { value in
                        guard swipeEnabled else { return }
                        if let direction = GameLogic.direction(from: value.translation.width, dy: value.translation.height, minDistance: 36) {
                            model.move(direction)
                        }
                        drag = .zero
                    }
            )
        }
        .aspectRatio(1, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private func overlay(
        title: String,
        subtitle: String,
        primary: String,
        primaryAction: @escaping () -> Void,
        secondary: String?,
        secondaryAction: (() -> Void)?
    ) -> some View {
        VStack(spacing: 10) {
            Text(title)
                .font(.system(size: 42, weight: .heavy))
                .foregroundStyle(Palette.overlayDark)
            Text(subtitle)
                .font(.system(size: 16))
                .foregroundStyle(Palette.instruction)
            actionButton(primary, enabled: true, action: primaryAction)
                .frame(width: 160)
            if let secondary, let secondaryAction {
                actionButton(secondary, enabled: true, action: secondaryAction)
                    .frame(width: 160)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Palette.overlay)
    }
}

#Preview {
    GameView()
}
