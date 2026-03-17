package com.example.squintscale.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.squintscale.presentation.screens.analytics.AnalyticsScreen
import com.example.squintscale.presentation.screens.calibration.CalibrationScreen
import com.example.squintscale.presentation.screens.home.HomeScreen
import com.example.squintscale.presentation.screens.input.InputScreen
import com.example.squintscale.presentation.screens.onboarding.OnboardingScreen
import com.example.squintscale.presentation.screens.processing.ProcessingScreen
import com.example.squintscale.presentation.screens.reading.ReadingScreen
import com.example.squintscale.presentation.screens.settings.SettingsScreen
import com.example.squintscale.presentation.screens.splash.SplashScreen

@Composable
fun AppNavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(navController = navController)
        }
        composable(Screen.Onboarding.route) {
            OnboardingScreen(navController = navController)
        }
        composable(Screen.Calibration.route) {
            CalibrationScreen(navController = navController)
        }
        composable(Screen.Home.route) {
            HomeScreen(navController = navController)
        }
        composable(Screen.Input.route) {
            InputScreen(navController = navController)
        }
        composable(
            route = Screen.Processing.route,
            arguments = listOf(navArgument("content") { type = NavType.StringType })
        ) { backStackEntry ->
            val content = backStackEntry.arguments?.getString("content") ?: ""
            ProcessingScreen(navController = navController, contentUri = content)
        }
        composable(
            route = Screen.Reading.route,
            arguments = listOf(navArgument("result") { type = NavType.StringType })
        ) { backStackEntry ->
            val sessionId = backStackEntry.arguments?.getString("result") ?: ""
            ReadingScreen(navController = navController, sessionId = sessionId)
        }
        composable(Screen.Analytics.route) {
            AnalyticsScreen(navController = navController)
        }
        composable(Screen.Settings.route) {
            SettingsScreen(navController = navController)
        }
    }
}
