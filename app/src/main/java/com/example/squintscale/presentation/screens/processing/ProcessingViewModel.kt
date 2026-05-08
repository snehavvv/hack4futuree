package com.example.squintscale.presentation.screens.processing

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.squintscale.data.local.dao.ReadingSessionDao
import com.example.squintscale.data.local.dao.UserProfileDao
import com.example.squintscale.data.local.entities.ReadingSessionEntity
import com.example.squintscale.data.remote.GeminiService
import com.example.squintscale.utils.OCRProcessor
import com.example.squintscale.utils.SquintScoreCalculator
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProcessingUiState(
    val statusMessage: String = "Initializing...",
    val progress: Float = 0f,
    val isComplete: Boolean = false,
    val resultSessionId: Int? = null,
    val processedText: String = "",
    val processedTitle: String = "",
    val error: String? = null
)

@HiltViewModel
class ProcessingViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val ocrProcessor: OCRProcessor,
    private val geminiService: GeminiService,
    private val squintScoreCalculator: SquintScoreCalculator,
    private val sessionDao: ReadingSessionDao,
    private val userProfileDao: UserProfileDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProcessingUiState())
    val uiState = _uiState.asStateFlow()

    fun processContent(contentUri: String) {
        viewModelScope.launch {
            try {
                _uiState.update { it.copy(statusMessage = "Scanning text...", progress = 0.2f) }
                val bitmap = loadBitmap(contentUri) ?: throw Exception("Failed to load image")
                
                val ocrResult = ocrProcessor.extractText(bitmap)
                _uiState.update { it.copy(statusMessage = "Analyzing readability with AI...", progress = 0.5f) }
                
                val geminiResponse = geminiService.analyzeImageForReadability(bitmap)
                
                _uiState.update { it.copy(statusMessage = "Applying your profile...", progress = 0.8f) }
                val userProfile = userProfileDao.getUserProfile().first()
                val score = squintScoreCalculator.compute(ocrResult, geminiResponse)
                
                val sessionTitle = "New Reading Session"
                val session = ReadingSessionEntity(
                    title = sessionTitle,
                    content = ocrResult.fullText,
                    startTime = System.currentTimeMillis(),
                    endTime = 0,
                    avgReadingSpeedWpm = 0,
                    squintScore = score,
                    completionPercent = 0
                )
                
                sessionDao.insertSession(session)
                val savedSession = sessionDao.getLatestSession().first()
                
                _uiState.update { it.copy(
                    statusMessage = "Optimizing for comfort...", 
                    progress = 1.0f,
                    isComplete = true,
                    resultSessionId = savedSession?.id,
                    processedText = ocrResult.fullText,
                    processedTitle = sessionTitle
                ) }
                
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message ?: "Processing failed") }
            }
        }
    }

    private fun loadBitmap(uriString: String): Bitmap? {
        return try {
            val uri = Uri.parse(uriString)
            val inputStream = context.contentResolver.openInputStream(uri)
            BitmapFactory.decodeStream(inputStream)
        } catch (e: Exception) {
            null
        }
    }
}
