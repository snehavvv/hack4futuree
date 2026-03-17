package com.example.squintscale.presentation.screens.analytics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.squintscale.data.local.dao.ReadingSessionDao
import com.example.squintscale.data.local.entities.ReadingSessionEntity
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import javax.inject.Inject

data class AnalyticsUiState(
    val sessions: List<ReadingSessionEntity> = emptyList(),
    val totalReadingTime: String = "00:00",
    val avgComfortScore: Int = 0,
    val docsProcessed: Int = 0,
    val isLoading: Boolean = true
)

@HiltViewModel
class AnalyticsViewModel @Inject constructor(
    private val sessionDao: ReadingSessionDao
) : ViewModel() {

    val uiState: StateFlow<AnalyticsUiState> = sessionDao.getAllSessions()
        .map { sessions ->
            val totalMillis = sessions.sumOf { it.endTime - it.startTime }.coerceAtLeast(0)
            val hours = totalMillis / (1000 * 60 * 60)
            val minutes = (totalMillis % (1000 * 60 * 60)) / (1000 * 60)
            
            AnalyticsUiState(
                sessions = sessions,
                totalReadingTime = String.format("%02d:%02d", hours, minutes),
                avgComfortScore = if (sessions.isNotEmpty()) sessions.map { it.squintScore }.average().toInt() else 0,
                docsProcessed = sessions.size,
                isLoading = false
            )
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = AnalyticsUiState()
        )
}
