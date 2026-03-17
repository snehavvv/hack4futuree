package com.example.squintscale.presentation.screens.input

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

enum class InputMode { CAMERA, FILE, URL }

data class InputUiState(
    val selectedMode: InputMode = InputMode.CAMERA,
    val isLoading: Boolean = false
)

@HiltViewModel
class InputViewModel @Inject constructor() : ViewModel() {
    private val _uiState = MutableStateFlow(InputUiState())
    val uiState = _uiState.asStateFlow()

    fun selectMode(mode: InputMode) {
        _uiState.value = _uiState.value.copy(selectedMode = mode)
    }
}
