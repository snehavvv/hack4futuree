package com.example.squintscale.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reading_sessions")
data class ReadingSessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val content: String,
    val startTime: Long,
    val endTime: Long,
    val avgReadingSpeedWpm: Int,
    val squintScore: Int,
    val completionPercent: Int
)
