import SwiftUI

enum Palette {
    static let background = Color(red: 250 / 255, green: 248 / 255, blue: 239 / 255)
    static let text = Color(red: 119 / 255, green: 110 / 255, blue: 101 / 255)
    static let textBright = Color(red: 249 / 255, green: 246 / 255, blue: 242 / 255)
    static let muted = Color(red: 187 / 255, green: 173 / 255, blue: 160 / 255)
    static let instruction = Color(red: 143 / 255, green: 122 / 255, blue: 102 / 255)
    static let logo = Color(red: 237 / 255, green: 194 / 255, blue: 46 / 255)
    static let scoreBox = Color(red: 61 / 255, green: 58 / 255, blue: 55 / 255)
    static let scoreLabel = Color(red: 238 / 255, green: 228 / 255, blue: 218 / 255)
    static let button = Color(red: 246 / 255, green: 94 / 255, blue: 59 / 255)
    static let grid = Color(red: 187 / 255, green: 173 / 255, blue: 160 / 255)
    static let emptyCell = Color(red: 205 / 255, green: 193 / 255, blue: 180 / 255)
    static let overlay = Color(red: 238 / 255, green: 228 / 255, blue: 218 / 255).opacity(0.92)
    static let overlayDark = Color(red: 119 / 255, green: 110 / 255, blue: 101 / 255)

    static func tile(_ value: Int) -> (Color, Color) {
        switch value {
        case 2: return (Color(red: 238 / 255, green: 228 / 255, blue: 218 / 255), text)
        case 4: return (Color(red: 237 / 255, green: 224 / 255, blue: 200 / 255), text)
        case 8: return (Color(red: 242 / 255, green: 177 / 255, blue: 121 / 255), textBright)
        case 16: return (Color(red: 245 / 255, green: 149 / 255, blue: 99 / 255), textBright)
        case 32: return (Color(red: 246 / 255, green: 124 / 255, blue: 95 / 255), textBright)
        case 64: return (Color(red: 246 / 255, green: 94 / 255, blue: 59 / 255), textBright)
        case 128: return (Color(red: 237 / 255, green: 207 / 255, blue: 114 / 255), textBright)
        case 256: return (Color(red: 237 / 255, green: 204 / 255, blue: 97 / 255), textBright)
        case 512: return (Color(red: 237 / 255, green: 200 / 255, blue: 80 / 255), textBright)
        case 1024: return (Color(red: 237 / 255, green: 197 / 255, blue: 63 / 255), textBright)
        case 2048: return (Color(red: 237 / 255, green: 194 / 255, blue: 46 / 255), textBright)
        default: return (Color(red: 60 / 255, green: 58 / 255, blue: 50 / 255), textBright)
        }
    }
}
