package com.example.squintscale.domain.repository

import com.example.squintscale.data.local.entities.ReadingSessionEntity
import com.example.squintscale.data.local.entities.UserProfileEntity
import kotlinx.coroutines.flow.Flow

interface ReadingRepository {
    fun getUserProfile(): Flow<UserProfileEntity?>
    suspend fun saveUserProfile(profile: UserProfileEntity)
    fun getAllSessions(): Flow<List<ReadingSessionEntity>>
    fun getLatestSession(): Flow<ReadingSessionEntity?>
    suspend fun saveSession(session: ReadingSessionEntity)
}
