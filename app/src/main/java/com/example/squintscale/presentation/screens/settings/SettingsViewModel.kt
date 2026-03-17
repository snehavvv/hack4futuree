package com.example.squintscale.presentation.screens.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.squintscale.data.local.dao.UserProfileDao
import com.example.squintscale.data.local.entities.UserProfileEntity
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsUiState(
    val userProfile: UserProfileEntity? = null,
    val isLoading: Boolean = true
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val userProfileDao: UserProfileDao
) : ViewModel() {

    val uiState: StateFlow<SettingsUiState> = userProfileDao.getUserProfile()
        .map { profile ->
            SettingsUiState(userProfile = profile, isLoading = false)
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = SettingsUiState()
        )

    fun updateProfile(profile: UserProfileEntity) {
        viewModelScope.launch {
            userProfileDao.updateUserProfile(profile)
        }
    }
}
