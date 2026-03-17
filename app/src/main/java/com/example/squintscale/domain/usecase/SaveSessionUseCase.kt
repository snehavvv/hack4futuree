package com.example.squintscale.domain.usecase

import com.example.squintscale.data.local.entities.ReadingSessionEntity
import com.example.squintscale.domain.repository.ReadingRepository
import javax.inject.Inject

class SaveSessionUseCase @Inject constructor(
    private val repository: ReadingRepository
) {
    suspend operator fun invoke(session: ReadingSessionEntity) {
        repository.saveSession(session)
    }
}
