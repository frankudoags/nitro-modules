import { type HybridObject } from 'react-native-nitro-modules'

export enum HapticStyle {
  Selection,
  ImpactLight,
  ImpactMedium,
  ImpactHeavy,
  NotificationSuccess,
  NotificationWarning,
  NotificationError,
}

export interface Haptics extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  trigger(style: HapticStyle): void
}
