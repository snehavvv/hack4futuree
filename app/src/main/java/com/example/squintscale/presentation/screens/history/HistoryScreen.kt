package com.example.squintscale.presentation.screens.history

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.squintscale.presentation.navigation.Screen
import com.example.squintscale.presentation.theme.*
import java.text.SimpleDateFormat
import java.util.*
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    navController: NavController,
    viewModel: HistoryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        containerColor = BackgroundDark,
        topBar = {
            TopAppBar(
                title = { Text("Reading History", color = TextPrimary) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = TextPrimary)
                    }
                },
                actions = {
                    if (uiState.historyItems.isNotEmpty()) {
                        IconButton(onClick = viewModel::clearAll) {
                            Icon(Icons.Default.Delete, "Clear All", tint = ErrorRed)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BackgroundDark)
            )
        }
    ) { padding ->
        if (uiState.historyItems.isEmpty() && !uiState.isLoading) {
            Column(
                modifier = Modifier.fillMaxSize().padding(padding),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(Icons.Default.History, null, modifier = Modifier.size(64.dp), tint = SurfaceLight)
                Spacer(modifier = Modifier.height(16.dp))
                Text("Start reading to see your history", color = TextSecondary)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(uiState.historyItems) { item ->
                    HistoryCard(
                        title = item.title,
                        preview = item.contentPreview,
                        timestamp = item.timestamp,
                        onClick = {
                            val encodedText = URLEncoder.encode(item.contentFull, StandardCharsets.UTF_8.toString())
                            val encodedTitle = URLEncoder.encode(item.title, StandardCharsets.UTF_8.toString())
                            navController.navigate(Screen.Reading.createRoute(encodedText, encodedTitle, item.sourceType))
                        },
                        onDelete = { viewModel.deleteItem(item.id) }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryCard(title: String, preview: String, timestamp: Long, onClick: () -> Unit, onDelete: () -> Unit) {
    val date = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault()).format(Date(timestamp))
    
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text(title, style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                Text(date, style = MaterialTheme.typography.labelSmall, color = TextSecondary)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(preview, maxLines = 2, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
            IconButton(onClick = onDelete, modifier = Modifier.align(Alignment.End)) {
                Icon(Icons.Default.Delete, null, tint = ErrorRed.copy(alpha = 0.6f))
            }
        }
    }
}
