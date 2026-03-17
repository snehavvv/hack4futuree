package com.example.squintscale.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_profile")
data class UserProfileEntity(
    @PrimaryKey val id: Int = 1,
    val name: String,
    val fontFamily: String,
    val fontSize: Float,
    val colorOverlay: String,
    val lineSpacing: Float,
    val isDyslexiaMode: Boolean,
    val isFocusMode: Boolean,
    val visualComfortScore: Int
)
