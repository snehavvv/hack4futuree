package com.example.squintscale.di

import com.google.ai.client.generativeai.GenerativeModel
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideGenerativeModel(): GenerativeModel {
        // Replace with actual API key in a secure way (e.g., BuildConfig or local.properties)
        return GenerativeModel(
            modelName = "gemini-pro-vision",
            apiKey = "YOUR_GEMINI_API_KEY"
        )
    }
}
