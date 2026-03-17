package com.example.squintscale.presentation.screens.reading

import androidx.compose.animation.*
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.AutoAwesome
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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReadingScreen(
    navController: NavController,
    sessionId: String,
    viewModel: ReadingViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    LaunchedEffect(sessionId) {
        viewModel.loadSession(sessionId)
    }

    // Detect scroll pauses for AI suggestions
    LaunchedEffect(listState.isScrollInProgress) {
        if (!listState.isScrollInProgress) {
            delay(3000)
            if (!listState.isScrollInProgress) {
                viewModel.onScrollPaused()
            }
        }
    }

    // Tracking progress
    LaunchedEffect(listState.firstVisibleItemIndex) {
        uiState.session?.let {
            val totalItems = it.content.split("\n\n").size
            val progress = (listState.firstVisibleItemIndex.toFloat() / totalItems).coerceIn(0f, 1f)
            viewModel.updateProgress(progress)
        }
    }

    val overlayColor = when (uiState.colorOverlay) {
        "Warm" -> Color(0xFFFF9800).copy(alpha = 0.12f)
        "Cool" -> Color(0xFF2196F3).copy(alpha = 0.12f)
        "Sepia" -> Color(0xFF795548).copy(alpha = 0.12f)
        else -> Color.Transparent
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(uiState.session?.title ?: "Reading", color = TextPrimary) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                actions = {
                    IconButton(onClick = viewModel::toggleFocusMode) {
                        Icon(
                            imageVector = if (uiState.isFocusMode) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = "Focus Mode",
                            tint = if (uiState.isFocusMode) SoftPurple else TextPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BackgroundDark)
            )
        },
        containerColor = BackgroundDark
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            // Background Overlay
            Box(modifier = Modifier.fillMaxSize().background(overlayColor))

            val paragraphs = uiState.session?.content?.split("\n\n") ?: emptyList()

            if (uiState.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center), color = SoftPurple)
            } else if (uiState.isFocusMode) {
                // Focus Mode: Single paragraph view
                val currentIndex = listState.firstVisibleItemIndex.coerceIn(0, paragraphs.size - 1)
                Column(
                    modifier = Modifier.fillMaxSize().padding(24.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    AnimatedContent(targetState = currentIndex, label = "focus") { index ->
                        ReadingTextBlock(
                            text = paragraphs[index],
                            fontSize = uiState.fontSize,
                            lineSpacing = uiState.lineSpacing,
                            fontFamily = if (uiState.userProfile?.isDyslexiaMode == true) LexendFont else InterFont
                        )
                    }
                    Spacer(modifier = Modifier.height(32.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        IconButton(
                            onClick = { if (currentIndex > 0) scope.launch { listState.scrollToItem(currentIndex - 1) } },
                            enabled = currentIndex > 0
                        ) { Icon(Icons.Default.ChevronLeft, "Prev", tint = TextPrimary) }
                        IconButton(
                            onClick = { if (currentIndex < paragraphs.size - 1) scope.launch { listState.scrollToItem(currentIndex + 1) } },
                            enabled = currentIndex < paragraphs.size - 1
                        ) { Icon(Icons.Default.ChevronRight, "Next", tint = TextPrimary) }
                    }
                }
            } else {
                // Normal Scrolling View
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp),
                    contentPadding = PaddingValues(top = 16.dp, bottom = 150.dp)
                ) {
                    itemsIndexed(paragraphs) { index, paragraph ->
                        ReadingTextBlock(
                            text = paragraph,
                            fontSize = uiState.fontSize,
                            lineSpacing = uiState.lineSpacing,
                            fontFamily = if (uiState.userProfile?.isDyslexiaMode == true) LexendFont else InterFont
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                    }
                }
            }

            // Reading Ruler (Focus Bar)
            if (!uiState.isFocusMode) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(2.dp)
                        .padding(horizontal = 24.dp)
                        .offset(y = 300.dp) // Simplified static offset for now
                        .background(SoftPurple.copy(alpha = 0.5f))
                )
            }

            // Floating Controls
            ReadingControls(
                modifier = Modifier.align(Alignment.BottomCenter),
                uiState = uiState,
                onFontSizeChange = viewModel::updateFontSize,
                onSpacingChange = viewModel::updateLineSpacing,
                onOverlayChange = viewModel::updateOverlay,
                onSpeak = {
                    val text = paragraphs.getOrNull(listState.firstVisibleItemIndex) ?: ""
                    viewModel.speak(text)
                }
            )

            // AI Suggestion Card
            AnimatedVisibility(
                visible = uiState.currentSuggestion != null,
                enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
                exit = slideOutVertically(targetOffsetY = { it }) + fadeOut(),
                modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 160.dp, start = 16.dp, end = 16.dp)
            ) {
                uiState.currentSuggestion?.let { suggestion ->
                    SuggestionCard(
                        text = suggestion,
                        onDismiss = viewModel::dismissSuggestion,
                        onApply = {
                            // Example apply: auto-increase spacing
                            viewModel.updateLineSpacing(uiState.lineSpacing + 0.2f)
                            viewModel.dismissSuggestion()
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun ReadingTextBlock(
    text: String,
    fontSize: Float,
    lineSpacing: Float,
    fontFamily: FontFamily
) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodyLarge.copy(
            fontSize = fontSize.sp,
            lineHeight = (fontSize * lineSpacing).sp,
            fontFamily = fontFamily
        ),
        color = TextPrimary,
        textAlign = TextAlign.Justify
    )
}

@Composable
fun ReadingControls(
    modifier: Modifier = Modifier,
    uiState: ReadingUiState,
    onFontSizeChange: (Float) -> Unit,
    onSpacingChange: (Float) -> Unit,
    onOverlayChange: (String) -> Unit,
    onSpeak: () -> Unit
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.FormatSize, contentDescription = null, tint = TextSecondary)
                Slider(
                    value = uiState.fontSize,
                    onValueChange = onFontSizeChange,
                    valueRange = 16f..32f,
                    modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
                    colors = SliderDefaults.colors(thumbColor = SoftPurple, activeTrackColor = SoftPurple)
                )
                Text("${uiState.fontSize.toInt()}sp", color = TextPrimary, fontSize = 12.sp)
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.FormatLineSpacing, contentDescription = null, tint = TextSecondary)
                Slider(
                    value = uiState.lineSpacing,
                    onValueChange = onSpacingChange,
                    valueRange = 1.0f..2.5f,
                    modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
                    colors = SliderDefaults.colors(thumbColor = SoftPurple, activeTrackColor = SoftPurple)
                )
                Text("${String.format("%.1f", uiState.lineSpacing)}x", color = TextPrimary, fontSize = 12.sp)
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                listOf("None", "Warm", "Cool", "Sepia").forEach { mode ->
                    FilterChip(
                        selected = uiState.colorOverlay == mode,
                        onClick = { onOverlayChange(mode) },
                        label = { Text(mode, fontSize = 10.sp) }
                    )
                }
                VerticalDivider(modifier = Modifier.height(24.dp).padding(horizontal = 8.dp), color = SurfaceLight.copy(alpha = 0.1f))
                IconButton(onClick = onSpeak) {
                    Icon(Icons.Default.PlayArrow, contentDescription = "Listen", tint = AccentGreen)
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = uiState.readingProgress,
                modifier = Modifier.fillMaxWidth().height(4.dp),
                color = SoftPurple,
                trackColor = BackgroundDark
            )
        }
    }
}

@Composable
fun SuggestionCard(
    text: String,
    onDismiss: () -> Unit,
    onApply: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SoftPurple),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.AutoMirrored.Filled.AutoAwesome, contentDescription = null, tint = Color.White)
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = "AI Suggestion", style = MaterialTheme.typography.labelSmall, color = Color.White.copy(alpha = 0.7f))
                Text(text = text, style = MaterialTheme.typography.bodyMedium, color = Color.White)
            }
            Row {
                TextButton(onClick = onDismiss) { Text("Ignore", color = Color.White) }
                Button(
                    onClick = onApply,
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = SoftPurple),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text("Apply", fontSize = 12.sp)
                }
            }
        }
    }
}
