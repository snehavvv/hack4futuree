package com.example.squintscale.presentation.screens.reading

import android.content.Context
import android.speech.tts.TextToSpeech
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.squintscale.data.local.dao.ReadingSessionDao
import com.example.squintscale.data.local.dao.UserProfileDao
import com.example.squintscale.data.local.entities.ReadingSessionEntity
import com.example.squintscale.data.local.entities.UserProfileEntity
import com.example.squintscale.data.remote.GeminiService
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

data class ReadingUiState(
    val session: ReadingSessionEntity? = null,
    val userProfile: UserProfileEntity? = null,
    val isLoading: Boolean = true,
    val fontSize: Float = 18f,
    val lineSpacing: Float = 1.2f,
    val colorOverlay: String = "None",
    val isFocusMode: Boolean = false,
    val currentSuggestion: String? = null,
    val readingProgress: Float = 0f
)

@HiltViewModel
class ReadingViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val sessionDao: ReadingSessionDao,
    private val userProfileDao: UserProfileDao,
    private val geminiService: GeminiService
) : ViewModel(), TextToSpeech.OnInitListener {

    private val _uiState = MutableStateFlow(ReadingUiState())
    val uiState = _uiState.asStateFlow()

    private var tts: TextToSpeech? = null
    private var lastPauseTime = System.currentTimeMillis()

    init {
        tts = TextToSpeech(context, this)
    }

    fun loadSession(sessionId: String) {
        viewModelScope.launch {
            val sessionFlow = if (sessionId == "latest") {
                sessionDao.getLatestSession()
            } else {
                // In a real app, query by ID. For now, just use latest or first.
                sessionDao.getLatestSession()
            }

            combine(
                sessionFlow,
                userProfileDao.getUserProfile()
            ) { session, profile ->
                _uiState.update { it.copy(
                    session = session,
                    userProfile = profile,
                    fontSize = profile?.fontSize ?: 18f,
                    lineSpacing = profile?.lineSpacing ?: 1.2f,
                    colorOverlay = profile?.colorOverlay ?: "None",
                    isFocusMode = profile?.isFocusMode ?: false,
                    isLoading = false
                ) }
            }.collect()
        }
    }

    fun updateFontSize(size: Float) {
        _uiState.update { it.copy(fontSize = size) }
    }

    fun updateLineSpacing(spacing: Float) {
        _uiState.update { it.copy(lineSpacing = spacing) }
    }

    fun updateOverlay(overlay: String) {
        _uiState.update { it.copy(colorOverlay = overlay) }
    }

    fun toggleFocusMode() {
        _uiState.update { it.copy(isFocusMode = !it.isFocusMode) }
    }

    fun onScrollPaused() {
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastPauseTime > 60000) { // Throttling 1 min
            lastPauseTime = currentTime
            viewModelScope.launch {
                val suggestion = geminiService.getReadingSuggestion("Current Font: ${_uiState.value.fontSize}, Spacing: ${_uiState.value.lineSpacing}")
                _uiState.update { it.copy(currentSuggestion = suggestion) }
            }
        }
    }

    fun dismissSuggestion() {
        _uiState.update { it.copy(currentSuggestion = null) }
    }

    fun speak(text: String) {
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.US
        }
    }

    override fun onCleared() {
        tts?.stop()
        tts?.shutdown()
        super.onCleared()
    }

    fun updateProgress(progress: Float) {
        _uiState.update { it.copy(readingProgress = progress) }
    }
}
