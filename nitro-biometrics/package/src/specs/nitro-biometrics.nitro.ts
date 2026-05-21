import type { HybridObject } from 'react-native-nitro-modules'
import type {
  BiometricsAvailability,
  AuthenticateOptions,
  BiometricsAuthResult,
} from './types'

export interface NitroBiometrics
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Returns availability, enrollment status, and supported biometric type
   * in a single call. Check this before calling authenticate().
   */
  getAvailability(): Promise<BiometricsAvailability>

  /**
   * Shows the biometric authentication prompt.
   *
   * `reason` maps to:
   *   - iOS (Touch ID): the prompt's localizedReason string
   *   - iOS (Face ID): ignored at runtime — set NSFaceIDUsageDescription in Info.plist
   *   - Android: the prompt's description field
   */
  authenticate(
    reason: string,
    options?: AuthenticateOptions
  ): Promise<BiometricsAuthResult>
}