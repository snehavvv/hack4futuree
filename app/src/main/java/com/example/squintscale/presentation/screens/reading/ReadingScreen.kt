package com.example.squintscale.presentation.screens.reading

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.squintscale.presentation.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReadingScreen(
    navController: NavController,
    text: String,
    title: String,
    sourceType: String,
    viewModel: ReadingViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val listState = rememberLazyListState()

    LaunchedEffect(text, title, sourceType) {
        viewModel.initReading(text, title, sourceType)
    }

    BackHandler {
        viewModel.onExit()
        navController.popBackStack()
    }

    // Tracking progress
    LaunchedEffect(listState.firstVisibleItemIndex) {
        val totalItems = uiState.text.split("\n\n").size
        if (totalItems > 0) {
            val progress = (listState.firstVisibleItemIndex.toFloat() / totalItems).coerceIn(0f, 1f)
            viewModel.updateProgress(progress)
        }
    }

    val overlayColor = when (uiState.colorOverlay) {
        "Warm" -> Color(0xFFFF9800).copy(alpha = 0.12f)
        "Cool" -> Color(0xFF2196F3).copy(alpha = 0.12f)
        "Sepia" -> Color(0xFF795548).copy(alpha = 0.12f)
        "Dark" -> Color.Black.copy(alpha = 0.8f)
        else -> Color.Transparent
    }

    val backgroundColor = if (uiState.colorOverlay == "Dark") Color.Black else BackgroundDark
    val textColor = if (uiState.colorOverlay == "Dark") Color.White else TextPrimary

    Scaffold(
        topBar = {
            Column {
                TopAppBar(
                    title = { Text(uiState.title, color = textColor) },
                    navigationIcon = {
                        IconButton(onClick = { 
                            viewModel.onExit()
                            navController.popBackStack() 
                        }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = textColor)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = backgroundColor)
                )
                LinearProgressIndicator(
                    progress = { uiState.readingProgress },
                    modifier = Modifier.fillMaxWidth().height(4.dp),
                    color = SoftPurple,
                    trackColor = backgroundColor
                )
            }
        },
        containerColor = backgroundColor
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            // Background Overlay
            Box(modifier = Modifier.fillMaxSize().background(overlayColor))

            val paragraphs = uiState.text.split("\n\n")

            if (uiState.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center), color = SoftPurple)
            } else {
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp),
                    contentPadding = PaddingValues(top = 16.dp, bottom = 150.dp)
                ) {
                    itemsIndexed(paragraphs) { _, paragraph ->
                        Text(
                            text = paragraph,
                            style = MaterialTheme.typography.bodyLarge.copy(
                                fontSize = uiState.fontSize.sp,
                                lineHeight = (uiState.fontSize * uiState.lineSpacing).sp,
                                fontFamily = if (uiState.userProfile?.isDyslexiaMode == true) LexendFont else InterFont,
                                letterSpacing = uiState.letterSpacing.sp
                            ),
                            color = textColor,
                            textAlign = TextAlign.Justify
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                    }
                }
            }

            // Floating Bottom Toolbar
            ReadingBottomBar(
                modifier = Modifier.align(Alignment.BottomCenter),
                uiState = uiState,
                onFontSizeDecrease = { viewModel.updateFontSize(-2f) },
                onFontSizeIncrease = { viewModel.updateFontSize(2f) },
                onToggleTts = viewModel::toggleTts,
                onBookmark = { /* Save to history with note logic */ }
            )
        }
    }
}

@Composable
fun ReadingBottomBar(
    modifier: Modifier = Modifier,
    uiState: ReadingUiState,
    onFontSizeDecrease: () -> Unit,
    onFontSizeIncrease: () -> Unit,
    onToggleTts: () -> Unit,
    onBookmark: () -> Unit
) {
    Card(
        modifier = modifier
            .padding(16.dp)
            .fillMaxWidth(),
        shape = RoundedCornerShape(32.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark.copy(alpha = 0.9f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 16.dp, vertical = 8.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onFontSizeDecrease) {
                    Icon(Icons.Default.Remove, contentDescription = "Decrease Font", tint = TextPrimary)
                }
                Text("A", fontSize = 16.sp, color = TextPrimary, modifier = Modifier.padding(horizontal = 4.dp))
                IconButton(onClick = onFontSizeIncrease) {
                    Icon(Icons.Default.Add, contentDescription = "Increase Font", tint = TextPrimary)
                }
            }

            VerticalDivider(modifier = Modifier.height(24.dp))

            IconButton(onClick = onToggleTts) {
                Icon(
                    imageVector = if (uiState.isTtsActive) Icons.Default.VolumeUp else Icons.Default.VolumeOff,
                    contentDescription = "Text to Speech",
                    tint = if (uiState.isTtsActive) SoftPurple else TextPrimary
                )
            }

            IconButton(onClick = onBookmark) {
                Icon(Icons.Default.BookmarkBorder, contentDescription = "Bookmark", tint = TextPrimary)
            }
            
            IconButton(onClick = { /* Contrast toggle logic */ }) {
                Icon(Icons.Default.Contrast, contentDescription = "Contrast", tint = TextPrimary)
            }
        }
    }
}
