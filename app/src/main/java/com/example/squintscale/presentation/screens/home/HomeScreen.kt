package com.example.squintscale.presentation.screens.home

import androidx.compose.animation.core.animateIntAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.squintscale.data.local.entities.ReadingSessionEntity
import com.example.squintscale.presentation.navigation.Screen
import com.example.squintscale.presentation.theme.*
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    val greeting = getGreeting()
                    Text(
                        text = "$greeting, ${uiState.userProfile?.name ?: "User"}",
                        style = MaterialTheme.typography.headlineMedium,
                        color = TextPrimary
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BackgroundDark)
            )
        },
        containerColor = BackgroundDark,
        bottomBar = { HomeBottomBar(navController) }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(16.dp))
                VisualComfortCard(score = uiState.userProfile?.visualComfortScore ?: 0)
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                SectionTitle("Continue Reading")
                LatestSessionCard(uiState.latestSession) {
                    uiState.latestSession?.let {
                        navController.navigate(Screen.Reading.createRoute(it.id.toString()))
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                SectionTitle("Quick Actions")
                QuickActionGrid(navController)
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun VisualComfortCard(score: Int) {
    val animatedScore by animateIntAsState(
        targetValue = score,
        animationSpec = tween(1000),
        label = "score"
    )

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Row(
            modifier = Modifier.padding(24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(modifier = Modifier.size(100.dp), contentAlignment = Alignment.Center) {
                CircularScoreArc(score = animatedScore)
                Text(
                    text = "$animatedScore",
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary
                )
            }
            Spacer(modifier = Modifier.width(24.dp))
            Column {
                Text(
                    text = "Visual Comfort Score",
                    style = MaterialTheme.typography.bodyLarge,
                    color = TextSecondary
                )
                Text(
                    text = getScoreStatus(animatedScore),
                    style = MaterialTheme.typography.titleMedium,
                    color = getScoreColor(animatedScore),
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun CircularScoreArc(score: Int) {
    val color = getScoreColor(score)
    Canvas(modifier = Modifier.size(100.dp)) {
        drawArc(
            color = SurfaceLight.copy(alpha = 0.1f),
            startAngle = 135f,
            sweepAngle = 270f,
            useCenter = false,
            style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)
        )
        drawArc(
            color = color,
            startAngle = 135f,
            sweepAngle = (score / 100f) * 270f,
            useCenter = false,
            style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)
        )
    }
}

@Composable
fun SectionTitle(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        color = TextPrimary,
        modifier = Modifier.padding(bottom = 12.dp)
    )
}

@Composable
fun LatestSessionCard(session: ReadingSessionEntity?, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        if (session != null) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = session.title, style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = session.completionPercent / 100f,
                    modifier = Modifier.fillMaxWidth(),
                    color = SoftPurple,
                    trackColor = BackgroundDark
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${session.completionPercent}% complete",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary
                )
            }
        } else {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "No recent sessions", color = TextSecondary)
            }
        }
    }
}

@Composable
fun QuickActionGrid(navController: NavController) {
    val actions = listOf(
        QuickAction("Camera Scan", Icons.Default.CameraAlt, "CAMERA", SoftPurple),
        QuickAction("Upload File", Icons.Default.FileUpload, "FILE", AccentGreen),
        QuickAction("Paste URL", Icons.Default.Link, "URL", WarningOrange),
        QuickAction("My History", Icons.Default.History, "HISTORY", Color.Cyan)
    )

    Column {
        Row(modifier = Modifier.fillMaxWidth()) {
            QuickActionItem(actions[0], Modifier.weight(1f)) { navController.navigate(Screen.Input.route) }
            Spacer(modifier = Modifier.width(16.dp))
            QuickActionItem(actions[1], Modifier.weight(1f)) { navController.navigate(Screen.Input.route) }
        }
        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth()) {
            QuickActionItem(actions[2], Modifier.weight(1f)) { navController.navigate(Screen.Input.route) }
            Spacer(modifier = Modifier.width(16.dp))
            QuickActionItem(actions[3], Modifier.weight(1f)) { navController.navigate(Screen.Analytics.route) }
        }
    }
}

@Composable
fun QuickActionItem(action: QuickAction, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier
            .height(100.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(action.icon, contentDescription = null, tint = action.color, modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = action.title, style = MaterialTheme.typography.labelMedium, color = TextPrimary)
        }
    }
}

data class QuickAction(val title: String, val icon: ImageVector, val id: String, val color: Color)

@Composable
fun HomeBottomBar(navController: NavController) {
    NavigationBar(containerColor = SurfaceDark) {
        NavigationBarItem(
            icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
            label = { Text("Home") },
            selected = true,
            onClick = { }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Book, contentDescription = "Reading") },
            label = { Text("Reading") },
            selected = false,
            onClick = { navController.navigate(Screen.Reading.createRoute("latest")) }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.BarChart, contentDescription = "Analytics") },
            label = { Text("Analytics") },
            selected = false,
            onClick = { navController.navigate(Screen.Analytics.route) }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
            label = { Text("Settings") },
            selected = false,
            onClick = { navController.navigate(Screen.Settings.route) }
        )
    }
}

fun getGreeting(): String {
    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    return when (hour) {
        in 0..11 -> "Good Morning"
        in 12..16 -> "Good Afternoon"
        else -> "Good Evening"
    }
}

fun getScoreStatus(score: Int): String = when {
    score >= 80 -> "Excellent"
    score >= 50 -> "Good"
    else -> "Needs Attention"
}

fun getScoreColor(score: Int): Color = when {
    score >= 80 -> AccentGreen
    score >= 50 -> WarningOrange
    else -> ErrorRed
}
