package com.example.squintscale.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "analytics_entries")
data class AnalyticsEntryEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val sessionId: Int,
    val timestamp: Long,
    val comfortScore: Int,
    val readingSpeedWpm: Int,
    val pauseCount: Int,
    val suggestionApplied: Boolean
)
