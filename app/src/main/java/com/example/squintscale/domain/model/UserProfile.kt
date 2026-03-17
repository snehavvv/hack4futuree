package com.example.squintscale.domain.model

data class UserProfile(
    val id: Int = 1,
    val name: String = "User",
    val fontFamily: String = "Inter",
    val fontSize: Float = 18f,
    val colorOverlay: String = "None",
    val lineSpacing: Float = 1.2f,
    val isDyslexiaMode: Boolean = false,
    val isFocusMode: Boolean = false,
    val visualComfortScore: Int = 0
)
