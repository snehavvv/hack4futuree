package com.example.squintscale.utils

import com.example.squintscale.data.remote.dto.AnalysisResponse
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SquintScoreCalculator @Inject constructor() {

    fun compute(ocrResult: ExtractedText, geminiResponse: AnalysisResponse?): Int {
        var baseScore = geminiResponse?.score ?: 70

        // Heuristic adjustments based on OCR results
        if (ocrResult.fullText.isBlank()) return 0
        
        // Example: Penalize if text density is too high or blocks are too small
        if (ocrResult.blocks.size > 20) baseScore -= 10
        
        // Adjust based on AI identified issues
        geminiResponse?.issues?.let { issues ->
            baseScore -= (issues.size * 5)
        }

        return baseScore.coerceIn(0, 100)
    }
}
