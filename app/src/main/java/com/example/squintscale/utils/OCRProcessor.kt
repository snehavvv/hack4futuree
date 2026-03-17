package com.example.squintscale.utils

import android.graphics.Bitmap
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

data class ExtractedText(
    val fullText: String,
    val blocks: List<String>
)

@Singleton
class OCRProcessor @Inject constructor() {
    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    suspend fun extractText(bitmap: Bitmap): ExtractedText {
        val image = InputImage.fromBitmap(bitmap, 0)
        return try {
            val result = recognizer.process(image).await()
            val blocks = result.textBlocks.map { it.text }
            ExtractedText(
                fullText = result.text,
                blocks = blocks
            )
        } catch (e: Exception) {
            ExtractedText("", emptyList())
        }
    }
}
