package com.example.squintscale.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.squintscale.data.local.dao.*
import com.example.squintscale.data.local.entities.*

@Database(
    entities = [
        UserProfileEntity::class,
        ReadingSessionEntity::class,
        AnalyticsEntryEntity::class,
        HistoryEntity::class
    ],
    version = 3,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract val userProfileDao: UserProfileDao
    abstract val readingSessionDao: ReadingSessionDao
    abstract val analyticsEntryDao: AnalyticsEntryDao
    abstract val historyDao: HistoryDao
}
