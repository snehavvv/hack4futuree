package com.example.squintscale.presentation.screens.home

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.jsoup.Jsoup
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val scannedText: String? = null,
    val showUrlDialog: Boolean = false
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    @ApplicationContext private val context: Context
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState = _uiState.asStateFlow()

    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    fun processImage(uri: Uri, onResult: (String) -> Unit) {
        _uiState.update { it.copy(isLoading = true) }
        val image = InputImage.fromFilePath(context, uri)
        recognizer.process(image)
            .addOnSuccessListener { visionText ->
                _uiState.update { it.copy(isLoading = false) }
                onResult(visionText.text)
            }
            .addOnFailureListener { e ->
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
    }

    fun extractUrlContent(url: String, onResult: (String) -> Unit) {
        val sanitizedUrl = if (!url.startsWith("http://") && !url.startsWith("https://")) {
            "https://$url"
        } else {
            url
        }

        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val doc = Jsoup.connect(sanitizedUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .referrer("http://www.google.com")
                    .followRedirects(true)
                    .timeout(15000)
                    .get()
                
                val content = doc.body().text()
                
                if (content.isBlank()) {
                    throw Exception("No readable text found on the page.")
                }

                withContext(Dispatchers.Main) {
                    _uiState.update { it.copy(isLoading = false) }
                    onResult(content)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    val errorMessage = when {
                        e.message?.contains("403") == true -> "Access denied by website. Try another link."
                        e.message?.contains("404") == true -> "Page not found. Check the URL."
                        else -> "Failed to fetch content: ${e.message}"
                    }
                    _uiState.update { it.copy(isLoading = false, error = errorMessage) }
                }
            }
        }
    }

    fun setShowUrlDialog(show: Boolean) {
        _uiState.update { it.copy(showUrlDialog = show) }
    }
}
