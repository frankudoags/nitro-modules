package com.nitrobiometrics

import com.margelo.nitro.core.Promise
import com.margelo.nitro.nitrobiometrics.BiometricsAuthResult
import com.margelo.nitro.nitrobiometrics.BiometricsAvailability
import com.margelo.nitro.nitrobiometrics.BiometricsKey
import com.margelo.nitro.nitrobiometrics.BiometricsSignature
import com.margelo.nitro.nitrobiometrics.HybridNitroBiometricsSpec

class HybridNitroBiometrics: HybridNitroBiometricsSpec() {
    override fun isAvailable(): BiometricsAvailability {
        TODO("Not yet implemented")
    }

    override fun authenticate(reason: String): Promise<BiometricsAuthResult> {
        TODO("Not yet implemented")
    }

    override fun createKeys(): Promise<BiometricsKey> {
        TODO("Not yet implemented")
    }

    override fun signPayload(payload: String): Promise<BiometricsSignature> {
        TODO("Not yet implemented")
    }

    override fun deleteKeys() {
        TODO("Not yet implemented")
    }
}
