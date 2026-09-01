#!/usr/bin/env python3
"""Generate simple original 2048 app icons (not copied from any commercial asset)."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

GOLD = (237, 194, 46, 255)
CREAM = (250, 248, 239, 255)
WHITE = (249, 246, 242, 255)
DARK = (61, 58, 55, 255)

DIGITS = {
    "2": [
        "01110",
        "10001",
        "00010",
        "00100",
        "01000",
        "10000",
        "11111",
    ],
    "0": [
        "01110",
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "01110",
    ],
    "4": [
        "10001",
        "10001",
        "10001",
        "11111",
        "00001",
        "00001",
        "00001",
    ],
    "8": [
        "01110",
        "10001",
        "10001",
        "01110",
        "10001",
        "10001",
        "01110",
    ],
}


def write_png(path: Path, width: int, height: int, pixels: bytearray) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw.extend(pixels[y * stride : (y + 1) * stride])

    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )
    path.write_bytes(png)


def fill(pixels: bytearray, width: int, x0: int, y0: int, x1: int, y1: int, color: tuple[int, int, int, int]) -> None:
    r, g, b, a = color
    for y in range(max(0, y0), min(width if False else y1, y1)):
        for x in range(max(0, x0), x1):
            if 0 <= x < width and 0 <= y:
                i = (y * width + x) * 4
                if i + 3 < len(pixels):
                    pixels[i : i + 4] = bytes((r, g, b, a))


def rounded_rect(
    pixels: bytearray,
    size: int,
    x0: int,
    y0: int,
    x1: int,
    y1: int,
    radius: int,
    color: tuple[int, int, int, int],
) -> None:
    r, g, b, a = color
    for y in range(y0, y1):
        for x in range(x0, x1):
            dx = 0
            dy = 0
            if x < x0 + radius and y < y0 + radius:
                dx = x0 + radius - x
                dy = y0 + radius - y
            elif x >= x1 - radius and y < y0 + radius:
                dx = x - (x1 - radius - 1)
                dy = y0 + radius - y
            elif x < x0 + radius and y >= y1 - radius:
                dx = x0 + radius - x
                dy = y - (y1 - radius - 1)
            elif x >= x1 - radius and y >= y1 - radius:
                dx = x - (x1 - radius - 1)
                dy = y - (y1 - radius - 1)
            if dx * dx + dy * dy > radius * radius:
                continue
            i = (y * size + x) * 4
            pixels[i : i + 4] = bytes((r, g, b, a))


def blit_text(pixels: bytearray, size: int, text: str, color: tuple[int, int, int, int], scale: int) -> None:
    glyph_w = 5
    glyph_h = 7
    gap = 1
    text_w = len(text) * glyph_w + (len(text) - 1) * gap
    text_h = glyph_h
    origin_x = (size - text_w * scale) // 2
    origin_y = (size - text_h * scale) // 2
    r, g, b, a = color
    for index, char in enumerate(text):
        pattern = DIGITS[char]
        gx = origin_x + index * (glyph_w + gap) * scale
        for row, line in enumerate(pattern):
            for col, bit in enumerate(line):
                if bit != "1":
                    continue
                for dy in range(scale):
                    for dx in range(scale):
                        x = gx + col * scale + dx
                        y = origin_y + row * scale + dy
                        i = (y * size + x) * 4
                        pixels[i : i + 4] = bytes((r, g, b, a))


def make_icon(size: int, background: tuple[int, int, int, int], inset: bool) -> bytearray:
    pixels = bytearray(size * size * 4)
    fill(pixels, size, 0, 0, size, size, background)
    pad = int(size * 0.18) if inset else int(size * 0.06)
    radius = max(8, size // 8)
    rounded_rect(pixels, size, pad, pad, size - pad, size - pad, radius, GOLD)
    scale = max(4, size // 42)
    blit_text(pixels, size, "2048", WHITE, scale)
    return pixels


def main() -> None:
    assets = Path("assets")
    assets.mkdir(exist_ok=True)
    write_png(assets / "icon.png", 1024, 1024, make_icon(1024, GOLD, False))
    write_png(assets / "adaptive-icon.png", 1024, 1024, make_icon(1024, (0, 0, 0, 0), True))
    write_png(assets / "splash-icon.png", 1024, 1024, make_icon(1024, CREAM, False))
    write_png(assets / "favicon.png", 64, 64, make_icon(64, GOLD, False))


if __name__ == "__main__":
    main()
