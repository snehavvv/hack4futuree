package com.example.squintscale.presentation.screens.processing

import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.squintscale.presentation.navigation.Screen
import com.example.squintscale.presentation.theme.BackgroundDark
import com.example.squintscale.presentation.theme.SoftPurple
import com.example.squintscale.presentation.theme.TextPrimary
import com.example.squintscale.presentation.theme.TextSecondary

@Composable
fun ProcessingScreen(
    navController: NavController,
    contentUri: String,
    viewModel: ProcessingViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.processContent(contentUri)
    }

    LaunchedEffect(uiState.isComplete) {
        if (uiState.isComplete) {
            navController.navigate(
                Screen.Reading.createRoute(
                    text = uiState.processedText,
                    title = uiState.processedTitle,
                    source = "OCR"
                )
            ) {
                popUpTo(Screen.Processing.route) { inclusive = true }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            PulsingDots()
            Spacer(modifier = Modifier.height(32.dp))
            
            Crossfade(targetState = uiState.statusMessage, label = "status") { message ->
                Text(
                    text = message,
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "${(uiState.progress * 100).toInt()}% complete",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )
        }
    }
}

@Composable
fun PulsingDots() {
    val infiniteTransition = rememberInfiniteTransition(label = "dots")
    val dotCount = 3
    val animations = List(dotCount) { index ->
        infiniteTransition.animateFloat(
            initialValue = 0.4f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(600, delayMillis = index * 200, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse
            ),
            label = "dot-$index"
        )
    }

    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        animations.forEach { scale ->
            Canvas(modifier = Modifier.size(16.dp)) {
                drawCircle(
                    color = SoftPurple,
                    radius = (size.minDimension / 2) * scale.value
                )
            }
        }
    }
}
