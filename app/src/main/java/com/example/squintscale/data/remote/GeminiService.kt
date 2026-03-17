package com.example.squintscale.data.remote

import android.graphics.Bitmap
import com.example.squintscale.data.remote.dto.AnalysisResponse
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GeminiService @Inject constructor(
    private val generativeModel: GenerativeModel
) {
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun analyzeImageForReadability(bitmap: Bitmap): AnalysisResponse? {
        val prompt = """
            Analyze this image for text readability. Return ONLY a JSON object with:
            { 
              "score": int(0-100), 
              "issues": [string], 
              "suggestions": [string], 
              "fontSizeEstimate": string, 
              "contrastRating": string 
            }
        """.trimIndent()

        return try {
            val response = generativeModel.generateContent(
                content {
                    image(bitmap)
                    text(prompt)
                }
            )
            response.text?.let { json.decodeFromString<AnalysisResponse>(it.trim()) }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun getReadingSuggestion(metrics: String): String {
        val prompt = "Given these reading metrics: $metrics, suggest ONE short improvement for visual comfort. Max 12 words."
        return try {
            val response = generativeModel.generateContent(prompt)
            response.text ?: "Try adjusting your font size for better clarity."
        } catch (e: Exception) {
            "Maintain a steady reading pace to reduce strain."
        }
    }

    suspend fun simplifyText(text: String): String {
        val prompt = "Simplify the following text for better cognitive accessibility while maintaining its core meaning: $text"
        return try {
            val response = generativeModel.generateContent(prompt)
            response.text ?: text
        } catch (e: Exception) {
            text
        }
    }
}
