package com.margelo.nitro.nitrohaptics

import android.Manifest
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.annotation.RequiresPermission
import com.margelo.nitro.NitroModules

class HybridHaptics: HybridHapticsSpec() {
    @RequiresPermission(Manifest.permission.VIBRATE)
    override fun trigger(style: HapticStyle) {
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val effectId = when (style) {
                HapticStyle.SELECTION -> VibrationEffect.EFFECT_TICK
                HapticStyle.IMPACTLIGHT -> VibrationEffect.EFFECT_TICK
                HapticStyle.IMPACTMEDIUM -> VibrationEffect.EFFECT_CLICK
                HapticStyle.IMPACTHEAVY -> VibrationEffect.EFFECT_HEAVY_CLICK
                HapticStyle.NOTIFICATIONSUCCESS -> VibrationEffect.EFFECT_CLICK
                HapticStyle.NOTIFICATIONWARNING -> VibrationEffect.EFFECT_DOUBLE_CLICK
                HapticStyle.NOTIFICATIONERROR -> VibrationEffect.EFFECT_HEAVY_CLICK
            }
            vibrator.vibrate(VibrationEffect.createPredefined(effectId))
        } else {
            // Fallback for API < 29
            val duration = when (style) {
                HapticStyle.SELECTION -> 10L
                HapticStyle.IMPACTLIGHT -> 10L
                HapticStyle.IMPACTMEDIUM -> 20L
                HapticStyle.IMPACTHEAVY -> 50L
                HapticStyle.NOTIFICATIONSUCCESS -> 20L
                HapticStyle.NOTIFICATIONWARNING -> 40L // Simplified
                HapticStyle.NOTIFICATIONERROR -> 60L
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(duration)
            }
        }
    }

    companion object {
        private val context = NitroModules.applicationContext ?: error("React native context not found")
    }
}
