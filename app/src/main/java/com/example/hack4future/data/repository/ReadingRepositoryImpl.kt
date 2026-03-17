package com.example.hack4future.data.repository

import com.example.squintscale.data.local.dao.ReadingSessionDao
import com.example.squintscale.data.local.dao.UserProfileDao
import com.example.squintscale.data.local.entities.ReadingSessionEntity
import com.example.squintscale.data.local.entities.UserProfileEntity
import com.example.squintscale.domain.repository.ReadingRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

// This file is a duplicate of the one in com.example.squintscale
// and should ideally be deleted. Fixing imports to resolve build error.
@Singleton
class ReadingRepositoryImpl @Inject constructor(
    private val userProfileDao: UserProfileDao,
    private val readingSessionDao: ReadingSessionDao
) : ReadingRepository {

    override fun getUserProfile(): Flow<UserProfileEntity?> {
        return userProfileDao.getUserProfile()
    }

    override suspend fun saveUserProfile(profile: UserProfileEntity) {
        userProfileDao.insertUserProfile(profile)
    }

    override fun getAllSessions(): Flow<List<ReadingSessionEntity>> {
        return readingSessionDao.getAllSessions()
    }

    override fun getLatestSession(): Flow<ReadingSessionEntity?> {
        return readingSessionDao.getLatestSession()
    }

    override suspend fun saveSession(session: ReadingSessionEntity) {
        readingSessionDao.insertSession(session)
    }
}
