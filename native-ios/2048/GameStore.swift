import Foundation

enum GameStore {
    private static let key = "native2048.game"

    static func load() -> GameState? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(GameState.self, from: data)
    }

    static func save(_ state: GameState) {
        if let data = try? JSONEncoder().encode(state) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }
}
