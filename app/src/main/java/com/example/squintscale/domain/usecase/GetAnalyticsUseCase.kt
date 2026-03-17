package com.example.squintscale.domain.usecase

import com.example.squintscale.data.local.entities.ReadingSessionEntity
import com.example.squintscale.domain.repository.ReadingRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetAnalyticsUseCase @Inject constructor(
    private val repository: ReadingRepository
) {
    operator fun invoke(): Flow<List<ReadingSessionEntity>> {
        return repository.getAllSessions()
    }
}
