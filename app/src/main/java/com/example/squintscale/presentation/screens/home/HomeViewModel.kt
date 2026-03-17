package com.example.squintscale.presentation.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.squintscale.data.local.dao.ReadingSessionDao
import com.example.squintscale.data.local.dao.UserProfileDao
import com.example.squintscale.data.local.entities.ReadingSessionEntity
import com.example.squintscale.data.local.entities.UserProfileEntity
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import javax.inject.Inject

data class HomeUiState(
    val userProfile: UserProfileEntity? = null,
    val latestSession: ReadingSessionEntity? = null,
    val isLoading: Boolean = true
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val userProfileDao: UserProfileDao,
    private val readingSessionDao: ReadingSessionDao
) : ViewModel() {

    val uiState: StateFlow<HomeUiState> = combine(
        userProfileDao.getUserProfile(),
        readingSessionDao.getLatestSession()
    ) { profile, session ->
        HomeUiState(
            userProfile = profile,
            latestSession = session,
            isLoading = false
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = HomeUiState()
    )
}
