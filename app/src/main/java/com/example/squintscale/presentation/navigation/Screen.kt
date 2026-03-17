package com.example.squintscale.presentation.navigation

import java.net.URLEncoder

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object Calibration : Screen("calibration")
    object Home : Screen("home")
    object Input : Screen("input")
    object Processing : Screen("processing?content={content}") {
        fun createRoute(content: String) = "processing?content=${URLEncoder.encode(content, "UTF-8")}"
    }
    object Reading : Screen("reading?text={text}&title={title}&source={source}") {
        fun createRoute(text: String, title: String, source: String) = 
            "reading?text=${URLEncoder.encode(text, "UTF-8")}&title=${URLEncoder.encode(title, "UTF-8")}&source=${URLEncoder.encode(source, "UTF-8")}"
    }
    object Analytics : Screen("analytics")
    object History : Screen("history")
    object Settings : Screen("settings")
}
