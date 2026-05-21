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

export type SupportedBiometryType = BiometryType | null;


export type BiometricsUnavailableReason =
  | 'NOT_SUPPORTED'    // no biometric hardware on device
  | 'NOT_ENROLLED'     // hardware present but no biometrics enrolled
  | 'NOT_DETERMINED'   // iOS only: permission not yet requested
  | 'DENIED'          // iOS only: user denied Face ID permission
  | 'LOCKED_OUT'       // too many failed attempts; requires passcode to unlock
  | 'PASSCODE_NOT_SET'  // iOS requires a device passcode to use biometrics

/**
 * Response from getAvailability(), which combines availability, enrollment status, and supported biometric type in a single call.
 */
export interface BiometricsAvailability {
  available: boolean
  isEnrolled: boolean
  supportedBiometryTypes: SupportedBiometryType[]
  unavailableReason?: BiometricsUnavailableReason
}


export type BiometricsAuthError =
  | 'NOT_ENROLLED'     // no biometrics enrolled
  | 'USER_CANCEL'     // user pressed the cancel button 
  | 'APP_CANCEL'      // app cancelled (e.g. due to navigation)
  | 'SYSTEM_CANCEL'   // OS cancelled (e.g. app went to background)
  | 'USER_FALLBACK'   // user chose the passcode fallback option
  | 'LOCKED_OUT'      // too many failed attempts
  | 'NOT_AVAILABLE'   // biometrics became unavailable mid-session
  | 'UNKNOWN'         // catch-all for unexpected errors

export interface BiometricsAuthResult {
  success: boolean
  error?: BiometricsAuthError
}

export interface AuthenticateOptions {
  /** iOS only: custom label for the passcode fallback button. Defaults to "Enter Passcode" */
  fallbackLabel?: string
  /**
   * If true, disables the passcode fallback entirely.
   * On Android, disables DEVICE_CREDENTIAL as an allowed authenticator.
   */
  disableDeviceFallback?: boolean
  /** Custom cancel button label. Defaults to "Cancel" */
  cancelLabel?: string
  /** Android only: prompt title. Defaults to app name */
  title?: string
  /** Android only: prompt subtitle */
  subtitle?: string
}