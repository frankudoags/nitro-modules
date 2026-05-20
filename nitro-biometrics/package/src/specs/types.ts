
/**
 * Supported biometric types across iOS and Android. 
 */
export enum BiometryType {
    FACE_ID = 0,
    TOUCH_ID = 1,
    FINGERPRINT = 2,
    FACE = 3,
    IRIS = 4,
    NONE = 5,
}

export type SupportedBiometryType = BiometryType | null

/**
 * Biometric availability result.
 */
export interface BiometricsAvailability {
    isAvailable: boolean
    biometryType: SupportedBiometryType
    error?: string
}

/**
 * Result returned after biometric authentication.
 */
export interface BiometricsAuthResult {
    success: boolean
    error?: string
}

/**
 * Result returned after keypair generation or retrieval.
 */
export interface BiometricsKey {
    publicKey: string
}

/**
 * Result returned when requesting the existing public key. If no key exists, returns null.
 */
export type MaybeBiometricsKey = BiometricsKey | null

/**
 * Result returned after signing a payload.
 */
export interface BiometricsSignature {
    signature: string
}

/**
 * Permission status values.
 */
export type BiometricsPermissionStatus = 'granted' | 'denied' | 'undetermined'

/**
 * Biometrics permission state.
 */
export interface BiometricsPermissionResponse {
    granted: boolean
    canAskAgain: boolean
    status: BiometricsPermissionStatus
}
