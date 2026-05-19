import { type HybridObject } from 'react-native-nitro-modules'

export type BatteryLevelResult = number | null
export type BatteryStateResult = 'unknown' | 'unplugged' | 'charging' | 'full'
export type BatterInfoCallback = (info: BatteryInfo) => void

export type BatteryInfo = {
  level: BatteryLevelResult
  state: BatteryStateResult
}

export interface Battery extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  getBatteryInfo(): BatteryInfo
  subscribe(callback: BatterInfoCallback): number
  unsubscribe(id: number): void
}
