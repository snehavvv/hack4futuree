package com.example.squintscale.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.example.squintscale.data.local.entities.AnalyticsEntryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AnalyticsEntryDao {
    @Query("SELECT * FROM analytics_entries ORDER BY timestamp DESC")
    fun getAllEntries(): Flow<List<AnalyticsEntryEntity>>

    @Insert
    suspend fun insertEntry(entry: AnalyticsEntryEntity)
}
