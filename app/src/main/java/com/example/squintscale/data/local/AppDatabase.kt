package com.example.squintscale.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.squintscale.data.local.dao.UserProfileDao
import com.example.squintscale.data.local.dao.ReadingSessionDao
import com.example.squintscale.data.local.dao.AnalyticsEntryDao
import com.example.squintscale.data.local.entities.UserProfileEntity
import com.example.squintscale.data.local.entities.ReadingSessionEntity
import com.example.squintscale.data.local.entities.AnalyticsEntryEntity

@Database(
    entities = [
        UserProfileEntity::class,
        ReadingSessionEntity::class,
        AnalyticsEntryEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract val userProfileDao: UserProfileDao
    abstract val readingSessionDao: ReadingSessionDao
    abstract val analyticsEntryDao: AnalyticsEntryDao
}
