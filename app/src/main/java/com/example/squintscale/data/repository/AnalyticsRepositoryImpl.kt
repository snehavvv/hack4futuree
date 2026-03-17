package com.example.squintscale.data.repository

import com.example.squintscale.data.local.dao.AnalyticsEntryDao
import com.example.squintscale.data.local.entities.AnalyticsEntryEntity
import com.example.squintscale.domain.repository.AnalyticsRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AnalyticsRepositoryImpl @Inject constructor(
    private val analyticsEntryDao: AnalyticsEntryDao
) : AnalyticsRepository {

    override fun getAnalyticsEntries(): Flow<List<AnalyticsEntryEntity>> {
        return analyticsEntryDao.getAllEntries()
    }

    override suspend fun saveAnalyticsEntry(entry: AnalyticsEntryEntity) {
        analyticsEntryDao.insertEntry(entry)
    }
}
