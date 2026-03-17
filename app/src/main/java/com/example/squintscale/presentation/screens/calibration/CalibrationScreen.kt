package com.example.squintscale.presentation.screens.calibration

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.animateIntAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.squintscale.presentation.navigation.Screen
import com.example.squintscale.presentation.theme.*

@Composable
fun CalibrationScreen(
    navController: NavController,
    viewModel: CalibrationViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    LaunchedEffect(uiState.isCalibrationComplete) {
        if (uiState.isCalibrationComplete) {
            navController.navigate(Screen.Home.route) {
                popUpTo(Screen.Calibration.route) { inclusive = true }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .verticalScroll(scrollState)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(40.dp))
        Text(
            text = "Visual Calibration",
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary
        )
        Text(
            text = "Adjust the settings until the text is most comfortable to read.",
            style = MaterialTheme.typography.bodyLarge,
            color = TextSecondary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Blur/Comfort Test Block
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(SurfaceDark)
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            val blurValue by animateFloatAsState(targetValue = uiState.blurIntensity * 20f, label = "blur")
            
            // Color Overlay Simulator
            val overlayColor = when (uiState.selectedOverlay) {
                "Warm" -> Color(0xFFFF9800).copy(alpha = 0.15f)
                "Cool" -> Color(0xFF2196F3).copy(alpha = 0.15f)
                "Sepia" -> Color(0xFF795548).copy(alpha = 0.15f)
                else -> Color.Transparent
            }

            Box(modifier = Modifier.fillMaxSize()) {
                Text(
                    text = "The quick brown fox jumps over the lazy dog. Reading should be effortless and clear. If you find yourself squinting, adjust the blur slider to see how it affects your focus.",
                    style = MaterialTheme.typography.bodyLarge.copy(
                        fontSize = uiState.fontSize.sp,
                        fontFamily = when(uiState.selectedFont) {
                            "Lexend" -> LexendFont
                            "Inter" -> InterFont
                            else -> InterFont
                        }
                    ),
                    color = TextPrimary,
                    modifier = Modifier.blur(blurValue.dp)
                )
                Box(modifier = Modifier.fillMaxSize().background(overlayColor))
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Sliders
        CalibrationSlider(
            label = "Blur Sensitivity",
            value = uiState.blurIntensity,
            onValueChange = viewModel::updateBlur
        )

        CalibrationSlider(
            label = "Preferred Font Size",
            value = (uiState.fontSize - 12f) / 20f,
            onValueChange = { viewModel.updateFontSize(12f + it * 20f) }
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Font Selection
        Text("Font Family", color = TextSecondary, modifier = Modifier.fillMaxWidth())
        Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
            listOf("Inter", "Lexend").forEach { font ->
                FilterChip(
                    selected = uiState.selectedFont == font,
                    onClick = { viewModel.updateFont(font) },
                    label = { Text(font) },
                    modifier = Modifier.padding(end = 8.dp)
                )
            }
        }

        // Overlay Selection
        Text("Reading Overlay", color = TextSecondary, modifier = Modifier.fillMaxWidth())
        Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
            listOf("None", "Warm", "Cool", "Sepia").forEach { overlay ->
                FilterChip(
                    selected = uiState.selectedOverlay == overlay,
                    onClick = { viewModel.updateOverlay(overlay) },
                    label = { Text(overlay) },
                    modifier = Modifier.padding(end = 8.dp)
                )
            }
        }

        Spacer(modifier = Modifier.weight(1f))
        
        Button(
            onClick = viewModel::saveProfile,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = SoftPurple),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text("Set My Comfort Level", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun CalibrationSlider(label: String, value: Float, onValueChange: (Float) -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Text(text = label, color = TextSecondary, fontSize = 14.sp)
        Slider(
            value = value,
            onValueChange = onValueChange,
            colors = SliderDefaults.colors(
                thumbColor = SoftPurple,
                activeTrackColor = SoftPurple,
                inactiveTrackColor = SurfaceDark
            )
        )
    }
}
