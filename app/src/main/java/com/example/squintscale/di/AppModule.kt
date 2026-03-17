package com.example.squintscale.di

import android.content.Context
import com.example.squintscale.data.local.dao.ReadingSessionDao
import com.example.squintscale.data.local.dao.UserProfileDao
import com.example.squintscale.data.repository.ReadingRepositoryImpl
import com.example.squintscale.domain.repository.ReadingRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideReadingRepository(
        userProfileDao: UserProfileDao,
        readingSessionDao: ReadingSessionDao
    ): ReadingRepository {
        return ReadingRepositoryImpl(userProfileDao, readingSessionDao)
    }
}
