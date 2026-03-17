package com.example.squintscale.data.repository

import com.example.squintscale.data.local.dao.HistoryDao
import com.example.squintscale.data.local.entities.HistoryEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HistoryRepository @Inject constructor(
    private val historyDao: HistoryDao
) {
    fun getAllHistory(): Flow<List<HistoryEntity>> = historyDao.getAllHistory()

    suspend fun insertHistory(history: HistoryEntity) = historyDao.insertHistory(history)

    suspend fun getHistoryById(id: Int) = historyDao.getHistoryById(id)

    suspend fun deleteHistory(id: Int) = historyDao.deleteHistory(id)

    suspend fun clearAllHistory() = historyDao.clearAllHistory()
}
