package com.example.squintscale.presentation.screens.calibration

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.squintscale.data.local.dao.UserProfileDao
import com.example.squintscale.data.local.entities.UserProfileEntity
import com.example.squintscale.domain.model.UserProfile
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CalibrationUiState(
    val blurIntensity: Float = 0.5f,
    val fontSize: Float = 18f,
    val selectedOverlay: String = "None",
    val selectedFont: String = "Inter",
    val comfortScore: Int = 0,
    val isCalibrationComplete: Boolean = false
)

@HiltViewModel
class CalibrationViewModel @Inject constructor(
    private val userProfileDao: UserProfileDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(CalibrationUiState())
    val uiState: StateFlow<CalibrationUiState> = _uiState.asStateFlow()

    fun updateBlur(value: Float) {
        _uiState.update { it.copy(blurIntensity = value) }
    }

    fun updateFontSize(value: Float) {
        _uiState.update { it.copy(fontSize = value) }
    }

    fun updateOverlay(overlay: String) {
        _uiState.update { it.copy(selectedOverlay = overlay) }
    }

    fun updateFont(font: String) {
        _uiState.update { it.copy(selectedFont = font) }
    }

    fun saveProfile() {
        viewModelScope.launch {
            val score = calculateComfortScore(_uiState.value)
            _uiState.update { it.copy(comfortScore = score) }
            
            val profile = UserProfileEntity(
                id = 1,
                name = "User",
                fontFamily = _uiState.value.selectedFont,
                fontSize = _uiState.value.fontSize,
                colorOverlay = _uiState.value.selectedOverlay,
                lineSpacing = 1.2f,
                isDyslexiaMode = _uiState.value.selectedFont == "Lexend",
                isFocusMode = false,
                visualComfortScore = score
            )
            userProfileDao.insertUserProfile(profile)
            _uiState.update { it.copy(isCalibrationComplete = true) }
        }
    }

    private fun calculateComfortScore(state: CalibrationUiState): Int {
        // Mock logic for comfort score based on preferences
        var score = 100
        if (state.blurIntensity > 0.7f) score -= 20
        if (state.fontSize < 14f) score -= 15
        return score.coerceIn(0, 100)
    }
}
