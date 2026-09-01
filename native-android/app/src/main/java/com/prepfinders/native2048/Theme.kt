package com.prepfinders.native2048

import androidx.compose.ui.graphics.Color

object Palette {
    val background = Color(0xFFFAF8EF)
    val text = Color(0xFF776E65)
    val textBright = Color(0xFFF9F6F2)
    val muted = Color(0xFFBBADA0)
    val instruction = Color(0xFF8F7A66)
    val logo = Color(0xFFEDC22E)
    val scoreBox = Color(0xFF3D3A37)
    val scoreLabel = Color(0xFFEEE4DA)
    val button = Color(0xFFF65E3B)
    val grid = Color(0xFFBBADA0)
    val emptyCell = Color(0xFFCDC1B4)
    val overlay = Color(0xEBEEE4DA)
    val overlayDark = Color(0xFF776E65)
}

fun tileColors(value: Int): Pair<Color, Color> = when (value) {
    2 -> Color(0xFFEEE4DA) to Color(0xFF776E65)
    4 -> Color(0xFFEDE0C8) to Color(0xFF776E65)
    8 -> Color(0xFFF2B179) to Color(0xFFF9F6F2)
    16 -> Color(0xFFF59563) to Color(0xFFF9F6F2)
    32 -> Color(0xFFF67C5F) to Color(0xFFF9F6F2)
    64 -> Color(0xFFF65E3B) to Color(0xFFF9F6F2)
    128 -> Color(0xFFEDCF72) to Color(0xFFF9F6F2)
    256 -> Color(0xFFEDCC61) to Color(0xFFF9F6F2)
    512 -> Color(0xFFEDC850) to Color(0xFFF9F6F2)
    1024 -> Color(0xFFEDC53F) to Color(0xFFF9F6F2)
    2048 -> Color(0xFFEDC22E) to Color(0xFFF9F6F2)
    else -> Color(0xFF3C3A32) to Color(0xFFF9F6F2)
}
