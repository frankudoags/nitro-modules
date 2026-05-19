import { type HybridObject } from 'react-native-nitro-modules'

export type ClipboardReadResult = string | null

export interface Clipboard extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  read(): ClipboardReadResult
  write(text: string): void
}
