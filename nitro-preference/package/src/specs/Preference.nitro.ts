import { type HybridObject } from 'react-native-nitro-modules'

export type StringOutput = string | null
export type NumberOutput = number | null
export type BoolOutput = boolean | null

export type PreferenceEntry = {
  key: string
  stringValue: StringOutput
  numberValue: NumberOutput
  boolValue: BoolOutput
}

export interface Preference extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  getString(key: string): Promise<StringOutput>
  setString(key: string, value: string): Promise<void>
  getNumber(key: string): Promise<NumberOutput>
  setNumber(key: string, value: number): Promise<void>
  getBool(key: string): Promise<BoolOutput>
  setBool(key: string, value: boolean): Promise<void>
  remove(key: string): Promise<void>
  getAll(): Promise<PreferenceEntry[]>
  clear(): Promise<void>
}
