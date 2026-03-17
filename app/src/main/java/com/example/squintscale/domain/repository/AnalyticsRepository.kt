package com.example.squintscale.domain.repository

import com.example.squintscale.data.local.entities.AnalyticsEntryEntity
import kotlinx.coroutines.flow.Flow

interface AnalyticsRepository {
    fun getAnalyticsEntries(): Flow<List<AnalyticsEntryEntity>>
    suspend fun saveAnalyticsEntry(entry: AnalyticsEntryEntity)
}
