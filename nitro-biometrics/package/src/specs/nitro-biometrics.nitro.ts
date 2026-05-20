import type { HybridObject } from 'react-native-nitro-modules'
import type { BiometricsAuthResult, BiometricsAvailability, BiometricsKey, BiometricsPermissionResponse, BiometricsSignature, SupportedBiometryType } from './types'

export interface NitroBiometrics
  extends HybridObject<{
    ios: 'swift'
    android: 'kotlin'
  }> {

  // Returns biometric availability and capability info
  isAvailable(): BiometricsAvailability

  // Returns supported biometric types on the device
  supportedAuthenticationTypes(): Array<SupportedBiometryType>

  // Returns whether biometrics are enrolled
  isEnrolled(): boolean

  // Returns current biometric permission status
  getPermissionsAsync(): Promise<BiometricsPermissionResponse>

  // Requests biometric permission/auth access
  requestPermissionsAsync(reason: string): Promise<BiometricsPermissionResponse>

  // Shows biometric authentication prompt
  authenticate(reason: string): Promise<BiometricsAuthResult>

  // Generates a biometric-protected keypair
  createKeys(): Promise<BiometricsKey>

  // Returns whether a keypair already exists
  keysExist(): boolean

  // Returns the existing public key
  getPublicKey(): Promise<BiometricsKey>

  // Deletes the stored keypair
  deleteKeys(): void

  // Signs a payload using the protected private key
  signPayload(payload: string): Promise<BiometricsSignature>
}