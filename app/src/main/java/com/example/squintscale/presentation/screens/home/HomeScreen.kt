package com.example.squintscale.presentation.screens.home

import android.Manifest
import android.content.ClipboardManager
import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.squintscale.presentation.navigation.Screen
import com.example.squintscale.presentation.theme.*
import java.io.File
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    
    var tempPhotoUri by remember { mutableStateOf<Uri?>(null) }
    
    val cameraLauncher = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { success ->
        if (success && tempPhotoUri != null) {
            navController.navigate(Screen.Processing.createRoute(tempPhotoUri.toString()))
        }
    }

    val docLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let {
            navController.navigate(Screen.Processing.createRoute(it.toString()))
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            val file = File(context.cacheDir, "temp_photo_${System.currentTimeMillis()}.jpg")
            val uri = FileProvider.getUriForFile(context, "${context.packageName}.provider", file)
            tempPhotoUri = uri
            cameraLauncher.launch(uri)
        }
    }

    Scaffold(
        containerColor = BackgroundDark,
        topBar = {
            TopAppBar(
                title = { Text("SquintScale", color = TextPrimary, fontFamily = OutfitFont) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BackgroundDark),
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.History.route) }) {
                        Icon(Icons.Default.History, "History", tint = TextPrimary)
                    }
                    IconButton(onClick = { navController.navigate(Screen.Analytics.route) }) {
                        Icon(Icons.Default.BarChart, "Analytics", tint = TextPrimary)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Text("Quick Actions", style = MaterialTheme.typography.headlineMedium, color = TextPrimary)
            
            QuickActionCard("Camera Scan", Icons.Default.CameraAlt, "Scan physical text") {
                permissionLauncher.launch(Manifest.permission.CAMERA)
            }
            QuickActionCard("Upload Document", Icons.Default.UploadFile, "Image or Text Document") {
                docLauncher.launch("*/*")
            }
            QuickActionCard("Paste URL", Icons.Default.Link, "Read web articles") {
                viewModel.setShowUrlDialog(true)
            }

            if (uiState.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally), color = SoftPurple)
            }
            
            uiState.error?.let { Text(it, color = ErrorRed) }
        }

        if (uiState.showUrlDialog) {
            UrlInputDialog(
                onDismiss = { viewModel.setShowUrlDialog(false) },
                onConfirm = { url ->
                    viewModel.setShowUrlDialog(false)
                    viewModel.extractUrlContent(url) { text ->
                        navController.navigate(Screen.Reading.createRoute(text, "Web Article", "URL"))
                    }
                }
            )
        }
    }
}

@Composable
fun QuickActionCard(title: String, icon: ImageVector, subtitle: String, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = SoftPurple, modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(title, style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
            }
        }
    }
}

@Composable
fun UrlInputDialog(onDismiss: () -> Unit, onConfirm: (String) -> Unit) {
    var url by remember { mutableStateOf("") }
    val context = LocalContext.current
    
    LaunchedEffect(Unit) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = clipboard.primaryClip?.getItemAt(0)?.text?.toString() ?: ""
        if (clip.startsWith("http")) url = clip
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = SurfaceDark,
        titleContentColor = TextPrimary,
        textContentColor = TextSecondary,
        title = { Text("Paste URL") },
        text = {
            TextField(
                value = url,
                onValueChange = { url = it },
                placeholder = { Text("https://...") },
                modifier = Modifier.fillMaxWidth(),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = BackgroundDark,
                    unfocusedContainerColor = BackgroundDark,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                )
            )
        },
        confirmButton = {
            Button(onClick = { onConfirm(url) }, colors = ButtonDefaults.buttonColors(containerColor = SoftPurple)) { 
                Text("Extract", color = Color.White) 
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel", color = SoftPurple) }
        }
    )
}
