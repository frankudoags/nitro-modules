import { NitroModules } from 'react-native-nitro-modules'
import type { NitroBiometrics as NitroBiometricsSpec } from './specs/nitro-biometrics.nitro'

export const NitroBiometrics =
  NitroModules.createHybridObject<NitroBiometricsSpec>('NitroBiometrics')

export type {
  BiometryType,
  BiometryTypeResult,
  BiometricsAvailability,
  BiometricsAuthResult,
  BiometricsKey,
  BiometricsSignature,
} from './specs/types'