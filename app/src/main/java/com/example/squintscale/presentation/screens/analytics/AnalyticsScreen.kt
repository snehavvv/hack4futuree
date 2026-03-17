package com.example.squintscale.presentation.screens.analytics

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.squintscale.data.local.entities.ReadingSessionEntity
import com.example.squintscale.presentation.screens.home.CircularScoreArc
import com.example.squintscale.presentation.screens.home.getScoreColor
import com.example.squintscale.presentation.theme.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    navController: NavController,
    viewModel: AnalyticsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Reading Analytics", color = TextPrimary) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BackgroundDark)
            )
        },
        containerColor = BackgroundDark
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(16.dp))
                AnalyticsSummaryGrid(uiState)
                Spacer(modifier = Modifier.height(32.dp))
                Text("Recent Activity", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                Spacer(modifier = Modifier.height(16.dp))
            }

            if (uiState.sessions.isEmpty()) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().padding(48.dp), contentAlignment = Alignment.Center) {
                        Text("No data available yet.", color = TextSecondary)
                    }
                }
            } else {
                items(uiState.sessions) { session ->
                    SessionHistoryItem(session)
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }
    }
}

@Composable
fun AnalyticsSummaryGrid(uiState: AnalyticsUiState) {
    Column {
        Row(modifier = Modifier.fillMaxWidth()) {
            SummaryCard("Total Reading", uiState.totalReadingTime, SoftPurple, Modifier.weight(1f))
            Spacer(modifier = Modifier.width(16.dp))
            SummaryCard("Docs Read", uiState.docsProcessed.toString(), AccentGreen, Modifier.weight(1f))
        }
        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth()) {
            SummaryCard("Avg Comfort", "${uiState.avgComfortScore}%", WarningOrange, Modifier.weight(1f))
            Spacer(modifier = Modifier.width(16.dp))
            SummaryCard("Focus Sessions", (uiState.docsProcessed / 2).toString(), Color.Cyan, Modifier.weight(1f))
        }
    }
}

@Composable
fun SummaryCard(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.height(100.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = label, style = MaterialTheme.typography.labelSmall, color = TextSecondary)
            Text(text = value, style = MaterialTheme.typography.headlineSmall, color = color, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun SessionHistoryItem(session: ReadingSessionEntity) {
    val date = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault()).format(Date(session.startTime))
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = session.title, style = MaterialTheme.typography.titleSmall, color = TextPrimary)
                Text(text = date, style = MaterialTheme.typography.labelSmall, color = TextSecondary)
            }
            Box(contentAlignment = Alignment.Center) {
                CircularScoreArc(score = session.squintScore)
                Text(
                    text = "${session.squintScore}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = getScoreColor(session.squintScore)
                )
            }
        }
    }
}
