package com.example.squintscale.di

import android.content.Context
import androidx.room.Room
import com.example.squintscale.data.local.AppDatabase
import com.example.squintscale.data.local.dao.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "squint_scale_db"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    fun provideUserProfileDao(database: AppDatabase): UserProfileDao = database.userProfileDao

    @Provides
    fun provideReadingSessionDao(database: AppDatabase): ReadingSessionDao = database.readingSessionDao

    @Provides
    fun provideAnalyticsEntryDao(database: AppDatabase): AnalyticsEntryDao = database.analyticsEntryDao

    @Provides
    fun provideHistoryDao(database: AppDatabase): HistoryDao = database.historyDao
}
