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
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val doc = Jsoup.connect(url).get()
                val content = doc.body().text()
                withContext(Dispatchers.Main) {
                    _uiState.update { it.copy(isLoading = false) }
                    onResult(content)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _uiState.update { it.copy(isLoading = false, error = "Failed to fetch content: ${e.message}") }
                }
            }
        }
    }

    fun setShowUrlDialog(show: Boolean) {
        _uiState.update { it.copy(showUrlDialog = show) }
    }
}
