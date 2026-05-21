package com.margelo.nitro.nitrobiometrics

import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise

class HybridNitroBiometrics : HybridNitroBiometricsSpec() {
    override fun getAvailability(): Promise<BiometricsAvailability> {
        TODO("Not yet implemented")
    }

    override fun authenticate(
        reason: String,
        options: AuthenticateOptions?
    ): Promise<BiometricsAuthResult> {
        TODO("Not yet implemented")
    }

    companion object {
        private val context =
            NitroModules.applicationContext ?: error("React native context not found")
    }
}