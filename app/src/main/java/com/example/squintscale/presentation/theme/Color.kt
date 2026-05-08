package com.example.squintscale.presentation.theme

import androidx.compose.ui.graphics.Color

// Salt and Pepper Palette
val SaltWhite = Color(0xFFF2F2F2)
val LightPepper = Color(0xFFD9D9D9)
val MediumPepper = Color(0xFF8C8C8C)
val DarkPepper = Color(0xFF404040)
val CoalBlack = Color(0xFF1A1A1A)

// Functional Mapping
val BackgroundDark = CoalBlack
val SurfaceDark = DarkPepper
val SurfaceLight = LightPepper
val SoftPurple = MediumPepper // Keeping the name to avoid breaking code, but mapping to theme
val TextPrimary = SaltWhite
val TextSecondary = LightPepper
val ErrorRed = Color(0xFFD32F2F) // Muted Red for Salt & Pepper theme

// Legacy mapping for existing code compatibility
val AccentGreen = Color(0xFF757575)
val WarningOrange = Color(0xFFBDBDBD)
