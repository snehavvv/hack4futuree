package com.example.squintscale.domain.usecase

import com.example.squintscale.utils.ExtractedText
import com.example.squintscale.data.remote.dto.AnalysisResponse
import com.example.squintscale.utils.SquintScoreCalculator
import javax.inject.Inject

class GetSquintScoreUseCase @Inject constructor(
    private val calculator: SquintScoreCalculator
) {
    operator fun invoke(ocrResult: ExtractedText, geminiResponse: AnalysisResponse?): Int {
        return calculator.compute(ocrResult, geminiResponse)
    }
}
