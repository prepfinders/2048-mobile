import SwiftUI

@main
struct Native2048App: App {
    var body: some Scene {
        WindowGroup {
            GameView()
                .preferredColorScheme(.light)
        }
    }
}
