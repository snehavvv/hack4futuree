package com.example.squintscale.presentation.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object Calibration : Screen("calibration")
    object Home : Screen("home")
    object Input : Screen("input")
    object Processing : Screen("processing/{content}") {
        fun createRoute(content: String) = "processing/$content"
    }
    object Reading : Screen("reading/{result}") {
        fun createRoute(result: String) = "reading/$result"
    }
    object Analytics : Screen("analytics")
    object Settings : Screen("settings")
}
