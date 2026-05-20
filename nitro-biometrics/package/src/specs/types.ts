/**
 * Supported biometric types across iOS and Android.
 */
export enum BiometryType {
  FACE_ID = 0,
  TOUCH_ID = 1,
  FINGERPRINT = 2,
  FACE = 3,
  IRIS = 4,
}

/**
 * Permission status values.
 */
export type BiometricsPermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined'

/**
 * Common biometric error codes.
 */
export type BiometricsError =
  | 'user_cancel'
  | 'system_cancel'
  | 'not_available'
  | 'not_enrolled'
  | 'lockout'
  | 'authentication_failed'
  | 'unknown'

/**
 * Result returned from biometric availability checks.
 */
export interface BiometricsAvailability {
  isAvailable: boolean
  biometryType: BiometryType | null
  error?: BiometricsError
}

/**
 * Result returned after biometric authentication.
 */
export interface BiometricsAuthResult {
  success: boolean
  error?: BiometricsError
}

/**
 * Public key returned after generation/retrieval.
 */
export interface BiometricsKey {
  publicKey: string
}

/**
 * Result returned after signing a payload.
 */
export interface BiometricsSignature {
  signature: string
}

/**
 * Biometrics permission state.
 */
export interface BiometricsPermissionResponse {
  granted: boolean
  canAskAgain: boolean
  status: BiometricsPermissionStatus
}

/**
 * Options used during biometric authentication.
 */
export interface AuthenticateOptions {
  allowDeviceCredentials?: boolean
}

/**
 * Options used during key generation.
 */
export interface CreateKeysOptions {
  invalidateOnEnrollmentChange?: boolean
}