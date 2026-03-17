package com.example.squintscale.domain.usecase

import android.graphics.Bitmap
import com.example.squintscale.data.remote.GeminiService
import com.example.squintscale.data.remote.dto.AnalysisResponse
import javax.inject.Inject

class AnalyzeImageUseCase @Inject constructor(
    private val geminiService: GeminiService
) {
    suspend operator fun invoke(bitmap: Bitmap): AnalysisResponse? {
        return geminiService.analyzeImageForReadability(bitmap)
    }
}
