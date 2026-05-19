export enum BiometryType {
    FACE_ID = 0,
    TOUCH_ID = 1,
    FINGERPRINT = 2,
    FACE = 3,           // Android face unlock
    IRIS = 4,           // Android iris scanner
}


export type BiometryTypeResult = BiometryType | null

export interface BiometricsAvailability {
    isAvailable: boolean
    biometryType: BiometryTypeResult
    error?: string
}

export interface BiometricsAuthResult {
    success: boolean
    error?: string
}

export interface BiometricsKey {
    publicKey: string   // Base64-encoded public key
}

// Result of signing a payload
export interface BiometricsSignature {
    signature: string   // Base64-encoded signature
}