package com.example.squintscale.data.local.dao

import androidx.room.*
import com.example.squintscale.data.local.entities.HistoryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface HistoryDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHistory(history: HistoryEntity)

    @Query("SELECT * FROM history ORDER BY timestamp DESC")
    fun getAllHistory(): Flow<List<HistoryEntity>>

    @Query("SELECT * FROM history WHERE id = :id")
    suspend fun getHistoryById(id: Int): HistoryEntity?

    @Query("DELETE FROM history WHERE id = :id")
    suspend fun deleteHistory(id: Int)

    @Query("DELETE FROM history")
    suspend fun clearAllHistory()
}
