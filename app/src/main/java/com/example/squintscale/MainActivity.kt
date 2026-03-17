package com.example.squintscale

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.Surface
import androidx.navigation.compose.rememberNavController
import com.example.squintscale.presentation.navigation.AppNavGraph
import com.example.squintscale.presentation.theme.SquintScaleTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SquintScaleTheme {
                val navController = rememberNavController()
                Surface {
                    AppNavGraph(navController = navController)
                }
            }
        }
    }
}
