package com.example.squintscale.presentation.screens.settings

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.squintscale.presentation.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    navController: NavController,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()
    var showComfortDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp)
                .verticalScroll(scrollState)
        ) {
            Spacer(modifier = Modifier.height(16.dp))
            ProfileHeader()
            
            Spacer(modifier = Modifier.height(32.dp))
            
            SettingsSection("Accessibility & Reading") {
                SettingToggle(
                    title = "Dyslexia Friendly Mode",
                    subtitle = "Uses Lexend font for better readability",
                    checked = uiState.userProfile?.isDyslexiaMode ?: false,
                    onCheckedChange = { isChecked ->
                        uiState.userProfile?.let { viewModel.updateProfile(it.copy(isDyslexiaMode = isChecked)) }
                    }
                )
                SettingToggle(
                    title = "ADHD Focus Mode",
                    subtitle = "Minimizes distractions during reading",
                    checked = uiState.userProfile?.isFocusMode ?: false,
                    onCheckedChange = { isChecked ->
                        uiState.userProfile?.let { viewModel.updateProfile(it.copy(isFocusMode = isChecked)) }
                    }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
            
            SettingsSection("Appearance") {
                SettingToggle(
                    title = "Dark Mode",
                    subtitle = "Easier on the eyes in low light",
                    checked = uiState.userProfile?.isDarkMode ?: false,
                    onCheckedChange = { isChecked ->
                        uiState.userProfile?.let { viewModel.updateProfile(it.copy(isDarkMode = isChecked)) }
                    }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            SettingsSection("Visual Health") {
                Card(
                    onClick = { showComfortDialog = true },
                    modifier = Modifier.fillMaxWidth().padding(8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Visibility, null, tint = MaterialTheme.colorScheme.onPrimaryContainer)
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text(
                                "Check Visual Comfort Level", 
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                            Text(
                                "Get score & analysis based on your settings",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
            
            SettingsSection("Data & Privacy") {
                TextButton(onClick = { }, modifier = Modifier.fillMaxWidth()) {
                    Text("Clear All Reading History", color = MaterialTheme.colorScheme.error)
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }

        if (showComfortDialog) {
            VisualComfortAnalysisDialog(
                profile = uiState.userProfile,
                onDismiss = { showComfortDialog = false }
            )
        }
    }
}

@Composable
fun VisualComfortAnalysisDialog(profile: com.example.squintscale.data.local.entities.UserProfileEntity?, onDismiss: () -> Unit) {
    if (profile == null) return

    // Calculate a mock score based on settings
    val score = remember(profile) {
        var baseScore = 60
        if (profile.isDyslexiaMode) baseScore += 15
        if (profile.isFocusMode) baseScore += 10
        if (profile.isDarkMode) baseScore += 5
        if (profile.fontSize >= 18f) baseScore += 10
        baseScore.coerceAtMost(100)
    }

    val analysis = when {
        score >= 85 -> "Excellent! Your settings are highly optimized for visual comfort and focus."
        score >= 70 -> "Good setup. You've enabled several accessibility features that reduce eye strain."
        else -> "Consider enabling Dyslexia mode or increasing font size to improve your reading comfort."
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { 
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                Text("Visual Comfort Analysis", style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(16.dp))
                Box(contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(
                        progress = score / 100f,
                        modifier = Modifier.size(80.dp),
                        strokeWidth = 8.dp,
                        color = if (score > 70) Color(0xFF4CAF50) else Color(0xFFFF9800)
                    )
                    Text("$score%", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                }
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(analysis, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                RecommendationItem("Contrast", if (profile.isDarkMode) "Optimized" else "High (Consider Dark Mode)")
                RecommendationItem("Readability", if (profile.isDyslexiaMode) "Enhanced" else "Standard")
                RecommendationItem("Focus", if (profile.isFocusMode) "Active" else "Inactive")
            }
        },
        confirmButton = {
            Button(onClick = onDismiss) { Text("Got it") }
        }
    )
}

@Composable
fun RecommendationItem(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun ProfileHeader() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
            contentColor = MaterialTheme.colorScheme.onSurfaceVariant
        )
    ) {
        Row(
            modifier = Modifier.padding(24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier.size(64.dp).background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f), RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(32.dp))
            }
            Spacer(modifier = Modifier.width(20.dp))
            Column {
                Text(text = "User Name", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text(text = "Reading Enthusiast", style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

@Composable
fun SettingsSection(title: String, content: @Composable () -> Unit) {
    Column {
        Text(
            text = title, 
            style = MaterialTheme.typography.labelSmall, 
            color = MaterialTheme.colorScheme.primary, 
            modifier = Modifier.padding(bottom = 8.dp, start = 4.dp)
        )
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
                contentColor = MaterialTheme.colorScheme.onSurfaceVariant
            )
        ) {
            Column(modifier = Modifier.padding(8.dp)) {
                content()
            }
        }
    }
}

@Composable
fun SettingToggle(title: String, subtitle: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, fontWeight = FontWeight.Medium)
            Text(text = subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}
