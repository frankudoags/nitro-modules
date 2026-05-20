import type { HybridObject } from 'react-native-nitro-modules'
import type { BiometricsAvailability, BiometryType, BiometricsPermissionResponse, AuthenticateOptions, BiometricsAuthResult, CreateKeysOptions, BiometricsKey, BiometricsSignature } from './types'



/**
 * Main Nitro biometrics module.
 */
export interface NitroBiometrics
  extends HybridObject<{
    ios: 'swift'
    android: 'kotlin'
  }> {

  // Returns biometric availability and capability info
  isAvailable(): BiometricsAvailability

  // Returns supported biometric types on the device
  supportedAuthenticationTypes(): Array<BiometryType>

  // Returns whether biometrics are enrolled
  isEnrolled(): boolean

  // Returns current biometric permission status
  getPermissionsAsync(): Promise<BiometricsPermissionResponse>

  // Requests biometric permission/auth access
  requestPermissionsAsync(reason: string): Promise<BiometricsPermissionResponse>

  // Shows biometric authentication prompt
  authenticate(reason: string, options?: AuthenticateOptions): Promise<BiometricsAuthResult>

  // Generates a biometric-protected keypair
  createKeys(options?: CreateKeysOptions): Promise<BiometricsKey>

  // Returns whether a keypair already exists
  keysExist(): boolean

  // Returns the existing public key if present
  getPublicKey(): Promise<BiometricsKey | null>

  // Deletes the stored keypair
  deleteKeys(): void

  /**
   * Signs a UTF8 payload using:
   * UTF8 -> SHA256 -> ECDSA
   */
  signPayload(payload: string, options?: AuthenticateOptions): Promise<BiometricsSignature>
}