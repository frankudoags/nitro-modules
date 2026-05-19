import type { HybridObject } from 'react-native-nitro-modules'
import type { BiometricsAvailability, BiometricsAuthResult, BiometricsKey, BiometricsSignature } from './types'


export interface NitroBiometrics extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
  works(): boolean
  
  // Check if biometrics are available on this device
  isAvailable(): BiometricsAvailability

  // Show biometric prompt and authenticate the user
  authenticate(reason: string): Promise<BiometricsAuthResult>;

  // Generate an asymmetric keypair protected by biometrics
  createKeys(): Promise<BiometricsKey>

  // Sign a payload using the biometric-protected private key
  signPayload(payload: string): Promise<BiometricsSignature>

  // Delete the stored keypair
  deleteKeys(): void
}