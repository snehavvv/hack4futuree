package com.example.squintscale.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class AnalysisResponse(
    val score: Int,
    val issues: List<String>,
    val suggestions: List<String>,
    val fontSizeEstimate: String,
    val contrastRating: String
)
