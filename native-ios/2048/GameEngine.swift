import Foundation

enum Direction {
    case left, right, up, down
}

struct Tile: Identifiable, Equatable, Codable {
    var id: Int
    var value: Int
    var row: Int
    var col: Int
    var isNew: Bool = false
    var isMerged: Bool = false
}

struct GameSnapshot: Equatable, Codable {
    var tiles: [Tile]
    var score: Int
    var moves: Int
}

struct GameState: Equatable, Codable {
    var tiles: [Tile]
    var score: Int = 0
    var bestScore: Int = 0
    var moves: Int = 0
    var elapsedMs: Int = 0
    var won: Bool = false
    var wonAcknowledged: Bool = false
    var over: Bool = false
    var history: [GameSnapshot] = []
    var nextId: Int = 1

    var canUndo: Bool { !history.isEmpty }
    var showWin: Bool { won && !wonAcknowledged && !over }
}

enum GameLogic {
    static let size = 4
    private static let maxHistory = 20

    static func emptyBoard() -> [[Int]] {
        Array(repeating: Array(repeating: 0, count: size), count: size)
    }

    static func board(from tiles: [Tile]) -> [[Int]] {
        var board = emptyBoard()
        for tile in tiles {
            board[tile.row][tile.col] = tile.value
        }
        return board
    }

    static func emptyCells(_ board: [[Int]]) -> [(Int, Int)] {
        var cells: [(Int, Int)] = []
        for row in 0..<size {
            for col in 0..<size where board[row][col] == 0 {
                cells.append((row, col))
            }
        }
        return cells
    }

    static func slideAndMergeLine(_ line: [Int]) -> (line: [Int], score: Int, moved: Bool) {
        let compact = line.filter { $0 != 0 }
        var merged: [Int] = []
        var score = 0
        var index = 0
        while index < compact.count {
            if index + 1 < compact.count && compact[index] == compact[index + 1] {
                let value = compact[index] * 2
                merged.append(value)
                score += value
                index += 2
            } else {
                merged.append(compact[index])
                index += 1
            }
        }
        while merged.count < size { merged.append(0) }
        let moved = zip(merged, line).contains { $0 != $1 }
        return (merged, score, moved)
    }

    private static func lineCoordinates(lineIndex: Int, direction: Direction) -> [(Int, Int)] {
        (0..<size).map { slot in
            switch direction {
            case .left: return (lineIndex, slot)
            case .right: return (lineIndex, size - 1 - slot)
            case .up: return (slot, lineIndex)
            case .down: return (size - 1 - slot, lineIndex)
            }
        }
    }

    static func canMove(_ board: [[Int]]) -> Bool {
        if !emptyCells(board).isEmpty { return true }
        for row in 0..<size {
            for col in 0..<size {
                let value = board[row][col]
                if col + 1 < size && board[row][col + 1] == value { return true }
                if row + 1 < size && board[row + 1][col] == value { return true }
            }
        }
        return false
    }

    static func hasWinningTile(_ board: [[Int]]) -> Bool {
        board.contains { $0.contains { $0 >= 2048 } }
    }

    static func spawnTile(_ board: [[Int]], random: () -> Double = { Double.random(in: 0..<1) }) -> ([[Int]], (row: Int, col: Int, value: Int)?) {
        let empty = emptyCells(board)
        guard !empty.isEmpty else { return (board, nil) }
        let index = min(empty.count - 1, Int(random() * Double(empty.count)))
        let (row, col) = empty[index]
        let value = random() < 0.9 ? 2 : 4
        var next = board
        next[row][col] = value
        return (next, (row, col, value))
    }

    static func slideTiles(_ tiles: [Tile], direction: Direction) -> (tiles: [Tile], score: Int, moved: Bool) {
        var grid: [[Tile?]] = Array(repeating: Array(repeating: nil, count: size), count: size)
        for tile in tiles { grid[tile.row][tile.col] = tile }
        var nextTiles: [Tile] = []
        var scoreGained = 0
        var moved = false

        for lineIndex in 0..<size {
            let coords = lineCoordinates(lineIndex: lineIndex, direction: direction)
            let compact = coords.compactMap { grid[$0.0][$0.1] }
            var write = 0
            var index = 0
            while index < compact.count {
                let current = compact[index]
                let next = index + 1 < compact.count ? compact[index + 1] : nil
                let dest = coords[write]
                let movedThis = current.row != dest.0 || current.col != dest.1
                if let next, current.value == next.value {
                    nextTiles.append(Tile(id: current.id, value: current.value * 2, row: dest.0, col: dest.1, isMerged: true))
                    scoreGained += current.value * 2
                    if movedThis || next.row != dest.0 || next.col != dest.1 { moved = true }
                    index += 2
                } else {
                    nextTiles.append(Tile(id: current.id, value: current.value, row: dest.0, col: dest.1))
                    if movedThis { moved = true }
                    index += 1
                }
                write += 1
            }
        }
        return (nextTiles, scoreGained, moved)
    }

    static func tiles(from board: [[Int]], nextId: inout Int, isNew: Bool = false) -> [Tile] {
        var tiles: [Tile] = []
        for row in 0..<size {
            for col in 0..<size where board[row][col] > 0 {
                tiles.append(Tile(id: nextId, value: board[row][col], row: row, col: col, isNew: isNew))
                nextId += 1
            }
        }
        return tiles
    }

    static func newGame(bestScore: Int = 0, random: () -> Double = { Double.random(in: 0..<1) }) -> GameState {
        var board = emptyBoard()
        board = spawnTile(board, random: random).0
        board = spawnTile(board, random: random).0
        var nextId = 1
        let tiles = tiles(from: board, nextId: &nextId, isNew: true)
        return GameState(tiles: tiles, bestScore: bestScore, nextId: nextId)
    }

    static func applyMove(_ state: GameState, direction: Direction, random: () -> Double = { Double.random(in: 0..<1) }) -> GameState {
        if state.over || (state.won && !state.wonAcknowledged) { return state }
        let slid = slideTiles(state.tiles, direction: direction)
        if !slid.moved { return state }
        var next = state
        next.history.append(GameSnapshot(tiles: state.tiles.map { Tile(id: $0.id, value: $0.value, row: $0.row, col: $0.col) }, score: state.score, moves: state.moves))
        if next.history.count > maxHistory { next.history.removeFirst(next.history.count - maxHistory) }
        var tiles = slid.tiles.map { Tile(id: $0.id, value: $0.value, row: $0.row, col: $0.col, isMerged: $0.isMerged) }
        let spawned = spawnTile(board(from: tiles), random: random)
        if let spawned = spawned.1 {
            tiles.append(Tile(id: next.nextId, value: spawned.value, row: spawned.row, col: spawned.col, isNew: true))
            next.nextId += 1
        }
        next.tiles = tiles
        next.score += slid.score
        next.bestScore = max(next.bestScore, next.score)
        next.moves += 1
        let numeric = board(from: tiles)
        next.won = next.won || hasWinningTile(numeric)
        next.over = !canMove(numeric)
        return next
    }

    static func undo(_ state: GameState) -> GameState {
        guard let previous = state.history.last else { return state }
        var next = state
        next.tiles = previous.tiles.map { Tile(id: $0.id, value: $0.value, row: $0.row, col: $0.col) }
        next.score = previous.score
        next.moves = previous.moves
        next.history.removeLast()
        let numeric = board(from: next.tiles)
        next.won = hasWinningTile(numeric)
        if !next.won { next.wonAcknowledged = false }
        next.over = !canMove(numeric)
        return next
    }

    static func keepPlaying(_ state: GameState) -> GameState {
        guard state.won && !state.wonAcknowledged else { return state }
        var next = state
        next.wonAcknowledged = true
        return next
    }

    static func formatScore(_ value: Int) -> String {
        if value < 10_000 { return String(value) }
        if value < 1_000_000 {
            let thousands = (Double(value) / 100.0).rounded() / 10.0
            let text = thousands.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(thousands)) : String(thousands)
            return "\(text)k"
        }
        let millions = (Double(value) / 100_000.0).rounded() / 10.0
        let text = millions.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(millions)) : String(millions)
        return "\(text)m"
    }

    static func formatTime(_ elapsedMs: Int) -> String {
        let totalSeconds = max(0, elapsedMs / 1000)
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60
        return "\(minutes):\(String(format: "%02d", seconds))"
    }

    static func formatMoves(_ moves: Int) -> String {
        moves == 1 ? "1 move" : "\(moves) moves"
    }

    static func direction(from dx: CGFloat, dy: CGFloat, minDistance: CGFloat = 24) -> Direction? {
        if max(abs(dx), abs(dy)) < minDistance { return nil }
        if abs(dx) > abs(dy) { return dx > 0 ? .right : .left }
        return dy > 0 ? .down : .up
    }
}
