package com.example.squintscale.presentation.screens.reading

import android.content.Context
import android.speech.tts.TextToSpeech
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.squintscale.data.local.dao.HistoryDao
import com.example.squintscale.data.local.dao.UserProfileDao
import com.example.squintscale.data.local.entities.HistoryEntity
import com.example.squintscale.data.local.entities.UserProfileEntity
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

data class ReadingUiState(
    val text: String = "",
    val title: String = "",
    val sourceType: String = "MANUAL",
    val userProfile: UserProfileEntity? = null,
    val isLoading: Boolean = true,
    val fontSize: Float = 18f,
    val lineSpacing: Float = 1.2f,
    val letterSpacing: Float = 0f,
    val colorOverlay: String = "None",
    val isFocusMode: Boolean = false,
    val readingProgress: Float = 0f,
    val isTtsActive: Boolean = false
)

@HiltViewModel
class ReadingViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val userProfileDao: UserProfileDao,
    private val historyDao: HistoryDao
) : ViewModel(), TextToSpeech.OnInitListener {

    private val _uiState = MutableStateFlow(ReadingUiState())
    val uiState = _uiState.asStateFlow()

    private var tts: TextToSpeech? = null
    private var sessionStartTime: Long = 0

    init {
        tts = TextToSpeech(context, this)
    }

    fun initReading(text: String, title: String, sourceType: String) {
        sessionStartTime = System.currentTimeMillis()
        viewModelScope.launch {
            userProfileDao.getUserProfile().collect { profile ->
                val adjustedFontSize = when {
                    (profile?.visualComfortScore ?: 100) < 40 -> (profile?.fontSize ?: 18f) + 4f
                    (profile?.visualComfortScore ?: 100) < 70 -> (profile?.fontSize ?: 18f) + 2f
                    else -> profile?.fontSize ?: 18f
                }

                val adjustedLineSpacing = when {
                    (profile?.visualComfortScore ?: 100) < 40 -> 2.0f
                    (profile?.visualComfortScore ?: 100) < 70 -> 1.7f
                    else -> profile?.lineSpacing ?: 1.2f
                }

                _uiState.update { it.copy(
                    text = text,
                    title = title,
                    sourceType = sourceType,
                    userProfile = profile,
                    fontSize = adjustedFontSize,
                    lineSpacing = adjustedLineSpacing,
                    colorOverlay = profile?.colorOverlay ?: "None",
                    isLoading = false
                ) }
                
                saveToHistory(text, title, sourceType, adjustedFontSize, profile?.colorOverlay ?: "None")
            }
        }
    }

    private suspend fun saveToHistory(text: String, title: String, sourceType: String, fontSize: Float, contrast: String) {
        val history = HistoryEntity(
            title = title,
            contentPreview = text.take(100),
            contentFull = text,
            sourceType = sourceType,
            timestamp = System.currentTimeMillis(),
            readingDuration = 0, // Will update on exit
            fontSizeUsed = fontSize,
            contrastUsed = contrast
        )
        historyDao.insertHistory(history)
    }

    fun onExit() {
        val durationMillis = System.currentTimeMillis() - sessionStartTime
        val durationMinutes = durationMillis / (1000 * 60)
        // In a real app, update the last inserted history record with the final duration
    }

    fun updateFontSize(delta: Float) {
        _uiState.update { it.copy(fontSize = (it.fontSize + delta).coerceIn(12f, 40f)) }
    }

    fun toggleTts() {
        if (_uiState.value.isTtsActive) {
            tts?.stop()
        } else {
            tts?.speak(_uiState.value.text, TextToSpeech.QUEUE_FLUSH, null, null)
        }
        _uiState.update { it.copy(isTtsActive = !it.isTtsActive) }
    }

    fun updateProgress(progress: Float) {
        _uiState.update { it.copy(readingProgress = progress) }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) tts?.language = Locale.US
    }

    override fun onCleared() {
        tts?.shutdown()
        super.onCleared()
    }
}
