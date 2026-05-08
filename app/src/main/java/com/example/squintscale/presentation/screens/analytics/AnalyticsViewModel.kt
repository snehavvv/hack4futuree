package com.example.squintscale.presentation.screens.analytics

import androidx.lifecycle.ViewModel
import com.example.squintscale.data.local.dao.AnalyticsEntryDao
import com.example.squintscale.data.local.dao.HistoryDao
import com.example.squintscale.data.local.dao.UserProfileDao
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

data class AnalyticsUiState(
    val isLoading: Boolean = false,
    val readingStreak: Int = 0,
    val totalMinutes: Long = 0
)

@HiltViewModel
class AnalyticsViewModel @Inject constructor(
    private val historyDao: HistoryDao,
    private val analyticsDao: AnalyticsEntryDao,
    private val userProfileDao: UserProfileDao
) : ViewModel() {
    private val _uiState = MutableStateFlow(AnalyticsUiState())
    val uiState = _uiState.asStateFlow()
    
    // In a real app, populate charts here from DAOs
}
