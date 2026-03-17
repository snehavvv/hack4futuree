package com.example.squintscale.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "history")
data class HistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val contentPreview: String,
    val contentFull: String,
    val sourceType: String, // CAMERA, DOCUMENT, URL, MANUAL
    val timestamp: Long,
    val readingDuration: Long, // in minutes
    val fontSizeUsed: Float,
    val contrastUsed: String
)
