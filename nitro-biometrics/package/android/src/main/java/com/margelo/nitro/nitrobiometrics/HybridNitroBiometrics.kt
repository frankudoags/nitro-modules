package com.margelo.nitro.nitrobiometrics

import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import android.app.KeyguardManager
import android.content.Context
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.biometric.BiometricPrompt.PromptInfo

class HybridNitroBiometrics : HybridNitroBiometricsSpec() {
    override fun getAvailability(): Promise<BiometricsAvailability> {
        TODO("Not yet implemented")
    }

    override fun authenticate(
        reason: String, options: AuthenticateOptions?
    ): Promise<BiometricsAuthResult> {
        TODO("Not yet implemented")
    }

    private fun detectBiometryTypes(): Array<BiometryType> {
        // First check there's actually hardware — if not, nothing to detect
        if (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
            == BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE
        ) {
            return emptyArray()
        }

        val types = mutableListOf<BiometryType>()

        if (packageManager.hasSystemFeature("android.hardware.fingerprint")) {
            types.add(BiometryType.FINGERPRINT)
        }
        if (packageManager.hasSystemFeature("android.hardware.biometrics.face")
            || packageManager.hasSystemFeature("com.samsung.android.bio.face")
        ) {
            types.add(BiometryType.FACE)
        }
        if (packageManager.hasSystemFeature("android.hardware.biometrics.iris")) {
            types.add(BiometryType.IRIS)
        }

        return types.toTypedArray()
    }

    companion object {
        private val context =
            NitroModules.applicationContext ?: error("React native context not found")
        private val biometricManager by lazy { BiometricManager.from(context) }
        private val packageManager by lazy { context.packageManager }
        private val keyguardManager by lazy {
            context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        }
    }
}